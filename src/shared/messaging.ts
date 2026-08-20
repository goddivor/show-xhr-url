import type { DetailedRequest } from './types';

/**
 * The message contract between the three extension contexts. Every runtime message
 * is a member of one of the two unions below, so adding a message without handling
 * it anywhere becomes a type error rather than a silent no-op.
 */

/** Sent by the side panel or a content script, answered by the service worker. */
export type RequestMessage =
  | { type: 'GET_REQUESTS'; payload?: { tabId?: number | undefined } | undefined }
  | { type: 'CLEAR_TAB_REQUESTS'; payload: { tabId: number } }
  | { type: 'PAGE_REQUEST_OBSERVED'; payload: PageHookMessage };

/** Pushed by the service worker, with no answer expected. */
export interface BroadcastMessage {
  type: 'REQUESTS_UPDATED';
  payload: { tabId: number; requests: DetailedRequest[] };
}

/** Narrows a broadcast arriving on the shared runtime port. */
export function isBroadcastMessage(value: unknown): value is BroadcastMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { type?: unknown }).type === 'REQUESTS_UPDATED'
  );
}

export interface GetRequestsResponse {
  requests: DetailedRequest[];
  error?: string | undefined;
}

export interface ClearTabRequestsResponse {
  success: boolean;
}

const REQUEST_MESSAGE_TYPES = new Set<RequestMessage['type']>([
  'GET_REQUESTS',
  'CLEAR_TAB_REQUESTS',
  'PAGE_REQUEST_OBSERVED',
]);

/**
 * Narrows an arbitrary runtime message. Any extension page can send to the service worker,
 * so nothing that arrives there is a `RequestMessage` until this says so.
 */
export function isRequestMessage(value: unknown): value is RequestMessage {
  if (typeof value !== 'object' || value === null) return false;
  const type = (value as { type?: unknown }).type;
  return typeof type === 'string' && REQUEST_MESSAGE_TYPES.has(type as RequestMessage['type']);
}

/** The name the MAIN-world hook uses on `window.postMessage`. */
export const PAGE_HOOK_MESSAGE = 'SHOW_XHR_URL/PAGE_REQUEST' as const;

/** What the MAIN-world hook observes before the browser reports the request. */
export interface PageHookMessage {
  source: typeof PAGE_HOOK_MESSAGE;
  url: string;
  method: string;
  timestamp: number;
  initiator: 'xhr' | 'fetch';
}

export function isPageHookMessage(value: unknown): value is PageHookMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { source?: unknown }).source === PAGE_HOOK_MESSAGE
  );
}
