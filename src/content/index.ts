import { isPageHookMessage } from '@shared/messaging';

/**
 * Runs in the ISOLATED world. Its only job is to relay what the MAIN-world hook observes
 * to the service worker; it holds no state of its own, because a content script dies with
 * its page and anything it accumulated would be lost anyway.
 */

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  // A page can post anything it likes to itself, so both the origin and the payload shape
  // are checked before the message is trusted.
  if (event.source !== window || event.origin !== window.location.origin) return;
  if (!isPageHookMessage(event.data)) return;

  // The service worker owns the canonical record; this only tells it a page-level request
  // happened, so it can label the matching webRequest entry as XHR or fetch.
  chrome.runtime
    .sendMessage({ type: 'PAGE_REQUEST_OBSERVED', payload: event.data })
    .catch(() => undefined);
});
