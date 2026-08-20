import type {
  ClearTabRequestsResponse,
  GetRequestsResponse,
  RequestMessage,
} from '@shared/messaging';
import type { DetailedRequest } from '@shared/types';
import { clearAllRequests as clearStoredRequests, saveRequests } from './storage';

/**
 * Every call into the service worker goes through this module. Components and hooks never
 * build a runtime message themselves, so the message contract has exactly one caller per
 * message type and changing it cannot leave a stale string behind.
 */

async function send<TResponse>(message: RequestMessage): Promise<TResponse | undefined> {
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error) {
    // The service worker is asleep or the panel is closing. Neither is actionable here.
    console.warn('Service worker unreachable:', error);
    return undefined;
  }
}

export async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

export async function fetchRequests(tabId?: number): Promise<DetailedRequest[]> {
  const response = await send<GetRequestsResponse>({
    type: 'GET_REQUESTS',
    payload: tabId === undefined ? undefined : { tabId },
  });
  return response?.requests ?? [];
}

/**
 * Clears the tab everywhere at once: the service worker's memory, the IndexedDB mirror and
 * the caller's store. Clearing only one of the three leaves the next broadcast to put the
 * requests straight back.
 */
export async function clearRequestsEverywhere(onCleared: () => void): Promise<void> {
  const tabId = await getActiveTabId();
  if (tabId !== undefined) {
    await send<ClearTabRequestsResponse>({ type: 'CLEAR_TAB_REQUESTS', payload: { tabId } });
  }
  await clearStoredRequests();
  onCleared();
}

export { saveRequests };
