import type { DetailedRequest } from '@shared/types';
import type { PageHookMessage } from '@shared/messaging';

/**
 * `chrome.webRequest` reports both `fetch()` and `XMLHttpRequest` as the single resource
 * type `xmlhttprequest`. The MAIN-world hook can tell them apart, so its observations are
 * parked here briefly and matched against the network events by method and URL.
 *
 * The matching is best-effort by nature: the hook message and the webRequest event race
 * each other across two contexts, and identical concurrent calls are indistinguishable.
 * A wrong or missing label costs a filter chip, never a captured request.
 */

/** How long an unmatched observation is worth keeping. Beyond this the page has moved on. */
const HINT_TTL_MS = 10_000;

type Initiator = NonNullable<DetailedRequest['initiator']>;

interface Hint {
  initiator: Initiator;
  observedAt: number;
}

const hints = new Map<string, Hint[]>();

function keyOf(method: string, url: string): string {
  return `${method.toUpperCase()} ${url}`;
}

function prune(now: number): void {
  for (const [key, entries] of hints) {
    const fresh = entries.filter((hint) => now - hint.observedAt < HINT_TTL_MS);
    if (fresh.length === 0) hints.delete(key);
    else hints.set(key, fresh);
  }
}

export function rememberHint(message: PageHookMessage): void {
  const now = Date.now();
  prune(now);

  const key = keyOf(message.method, message.url);
  const entries = hints.get(key) ?? [];
  entries.push({ initiator: message.initiator, observedAt: now });
  hints.set(key, entries);
}

/** Consumes the oldest matching observation, so two identical calls get one label each. */
export function takeHint(method: string, url: string): Initiator | undefined {
  const key = keyOf(method, url);
  const entries = hints.get(key);
  if (!entries || entries.length === 0) return undefined;

  const [hint] = entries.splice(0, 1);
  if (entries.length === 0) hints.delete(key);
  return hint?.initiator;
}
