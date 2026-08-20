import type { DetailedRequest } from '@shared/types';

/**
 * The service worker's in-memory index of captured requests.
 *
 * Requests are keyed by the browser's `requestId` rather than by URL: the webRequest
 * lifecycle fires four separate events for one request, and a page that calls the same
 * endpoint twice would otherwise have its headers and status codes attributed to the
 * wrong entry.
 *
 * A service worker is evicted after ~30s of inactivity, so this store is deliberately
 * ephemeral; the side panel mirrors it into IndexedDB for durability.
 */

/** Beyond this, the oldest entries for a tab are dropped. A busy page emits thousands. */
const MAX_REQUESTS_PER_TAB = 2_000;

interface TabBucket {
  /** Insertion-ordered, which Map guarantees — that ordering is what makes eviction FIFO. */
  byId: Map<string, DetailedRequest>;
}

const tabs = new Map<number, TabBucket>();

function bucketFor(tabId: number): TabBucket {
  let bucket = tabs.get(tabId);
  if (!bucket) {
    bucket = { byId: new Map() };
    tabs.set(tabId, bucket);
  }
  return bucket;
}

export function addRequest(request: DetailedRequest): void {
  const bucket = bucketFor(request.tabId);
  bucket.byId.set(request.id, request);

  while (bucket.byId.size > MAX_REQUESTS_PER_TAB) {
    const oldest = bucket.byId.keys().next();
    if (oldest.done) break;
    bucket.byId.delete(oldest.value);
  }
}

/**
 * Merges a lifecycle update into an already-captured request. Returns `false` when the
 * request is unknown — which happens legitimately for requests that started before the
 * service worker woke up.
 */
export function updateRequest(
  tabId: number,
  requestId: string,
  patch: Partial<DetailedRequest>,
): boolean {
  const existing = tabs.get(tabId)?.byId.get(requestId);
  if (!existing) return false;
  Object.assign(existing, patch);
  return true;
}

export function getRequests(tabId: number): DetailedRequest[] {
  const bucket = tabs.get(tabId);
  if (!bucket) return [];
  return [...bucket.byId.values()];
}

export function countRequests(tabId: number): number {
  return tabs.get(tabId)?.byId.size ?? 0;
}

export function clearTab(tabId: number): void {
  tabs.get(tabId)?.byId.clear();
}

export function forgetTab(tabId: number): void {
  tabs.delete(tabId);
}
