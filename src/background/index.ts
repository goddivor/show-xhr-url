import type { RequestType } from '@shared/types';
import type {
  BroadcastMessage,
  ClearTabRequestsResponse,
  GetRequestsResponse,
} from '@shared/messaging';
import { isRequestMessage } from '@shared/messaging';
import { headersToRecord, parseContentLength } from './headers';
import { rememberHint, takeHint } from './page-hints';
import { extractRequestBody } from './request-body';
import {
  addRequest,
  clearTab,
  countRequests,
  forgetTab,
  getRequests,
  updateRequest,
} from './request-store';

/**
 * Service worker: the only place that talks to `chrome.webRequest`.
 *
 * It observes the four lifecycle events of every request, folds them into a single
 * record per `requestId`, and pushes the result to the side panel. It never blocks a
 * request — the extension is an observer, and `webRequestBlocking` is unavailable under
 * Manifest V3 anyway.
 */

const ALL_URLS: chrome.webRequest.RequestFilter = { urls: ['<all_urls>'] };

/** `tabId` is -1 for requests with no owning tab (other extensions, prefetch, …). */
const NO_TAB = -1;

const BADGE_COLOUR = '#4688f1';

/**
 * Broadcasting on every lifecycle event would send the full request array several
 * thousand times on a busy page. Coalescing into one frame-ish window keeps the panel
 * live without flooding the message port.
 */
const BROADCAST_INTERVAL_MS = 120;

const pendingBroadcasts = new Set<number>();
let broadcastTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleBroadcast(tabId: number): void {
  if (tabId === NO_TAB) return;
  pendingBroadcasts.add(tabId);

  if (broadcastTimer !== undefined) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = undefined;
    const tabIds = [...pendingBroadcasts];
    pendingBroadcasts.clear();

    for (const id of tabIds) {
      const message: BroadcastMessage = {
        type: 'REQUESTS_UPDATED',
        payload: { tabId: id, requests: getRequests(id) },
      };
      // Rejects when the side panel is closed, which is the normal case — not an error.
      chrome.runtime.sendMessage(message).catch(() => undefined);
      updateBadge(id);
    }
  }, BROADCAST_INTERVAL_MS);
}

function updateBadge(tabId: number): void {
  const count = countRequests(tabId);
  void chrome.action.setBadgeText({ tabId, text: count > 0 ? String(count) : '' });
  void chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOUR });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: unknown) => console.error('Cannot set side panel behaviour:', error));
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId === NO_TAB) return;

    addRequest({
      id: details.requestId,
      url: details.url,
      method: details.method,
      timestamp: details.timeStamp,
      status: 'pending',
      tabId: details.tabId,
      requestType: details.type as RequestType,
      initiator: takeHint(details.method, details.url),
      requestBody: extractRequestBody(details.requestBody),
    });

    scheduleBroadcast(details.tabId);
  },
  ALL_URLS,
  ['requestBody'],
);

chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    if (details.tabId === NO_TAB) return;

    const requestHeaders = headersToRecord(details.requestHeaders);
    const updated = updateRequest(details.tabId, details.requestId, {
      requestHeaders,
      referer: requestHeaders['referer'] ?? requestHeaders['referrer'],
      origin: requestHeaders['origin'],
    });

    if (updated) scheduleBroadcast(details.tabId);
  },
  ALL_URLS,
  ['requestHeaders'],
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId === NO_TAB) return;

    const responseHeaders = headersToRecord(details.responseHeaders);
    const updated = updateRequest(details.tabId, details.requestId, {
      statusCode: details.statusCode,
      statusLine: details.statusLine,
      responseHeaders,
      contentType: responseHeaders['content-type'],
      responseSize: parseContentLength(responseHeaders['content-length']),
    });

    if (updated) scheduleBroadcast(details.tabId);
  },
  ALL_URLS,
  ['responseHeaders'],
);

chrome.webRequest.onCompleted.addListener((details) => {
  if (details.tabId === NO_TAB) return;

  const updated = updateRequest(details.tabId, details.requestId, {
    status: 'complete',
    statusCode: details.statusCode,
    ip: details.ip,
    fromCache: details.fromCache,
    durationMs: Math.max(0, Math.round(details.timeStamp - getStartTime(details))),
  });

  if (updated) scheduleBroadcast(details.tabId);
}, ALL_URLS);

chrome.webRequest.onErrorOccurred.addListener((details) => {
  if (details.tabId === NO_TAB) return;

  const updated = updateRequest(details.tabId, details.requestId, {
    status: 'failed',
    error: details.error,
    ip: details.ip,
    fromCache: details.fromCache,
  });

  if (updated) scheduleBroadcast(details.tabId);
}, ALL_URLS);

/** The start timestamp lives on the stored record; fall back to the event's own clock. */
function getStartTime(details: { tabId: number; requestId: string; timeStamp: number }): number {
  const stored = getRequests(details.tabId).find((request) => request.id === details.requestId);
  return stored?.timestamp ?? details.timeStamp;
}

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse): boolean | undefined => {
    // Any extension page can post here, so the payload is narrowed before it is trusted.
    if (!isRequestMessage(message)) return undefined;

    if (message.type === 'GET_REQUESTS') {
      const explicitTabId = message.payload?.tabId;

      if (typeof explicitTabId === 'number') {
        sendResponse({ requests: getRequests(explicitTabId) } satisfies GetRequestsResponse);
        return undefined;
      }

      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(([tab]) => {
          sendResponse({
            requests: tab?.id === undefined ? [] : getRequests(tab.id),
          } satisfies GetRequestsResponse);
        })
        .catch((error: unknown) => {
          sendResponse({
            requests: [],
            error: error instanceof Error ? error.message : String(error),
          } satisfies GetRequestsResponse);
        });

      // Keeps the message port open for the asynchronous `sendResponse` above.
      return true;
    }

    if (message.type === 'PAGE_REQUEST_OBSERVED') {
      rememberHint(message.payload);
      return undefined;
    }

    // The union is exhausted here; TypeScript narrows the remainder to CLEAR_TAB_REQUESTS.
    {
      clearTab(message.payload.tabId);
      updateBadge(message.payload.tabId);
      sendResponse({ success: true } satisfies ClearTabRequestsResponse);
      return undefined;
    }
  },
);

chrome.tabs.onRemoved.addListener((tabId) => {
  forgetTab(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // A navigation makes the previous tab's requests belong to a page that is gone.
  if (changeInfo.status === 'loading' && changeInfo.url) {
    clearTab(tabId);
    updateBadge(tabId);
  }
});
