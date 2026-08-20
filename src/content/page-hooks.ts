import { PAGE_HOOK_MESSAGE, type PageHookMessage } from '@shared/messaging';

/**
 * Runs in the page's MAIN world, declared as such in the manifest.
 *
 * `chrome.webRequest` reports what the network layer sees; this hook reports what the
 * page's own code asked for, which is what identifies a request as XHR or fetch rather
 * than as a generic `xmlhttprequest` resource type.
 *
 * It is a declared content script, never an injected `<script>` with inline source: a
 * page with a strict `script-src` Content Security Policy blocks the latter outright.
 */

function report(url: string, method: string, initiator: PageHookMessage['initiator']): void {
  const message: PageHookMessage = {
    source: PAGE_HOOK_MESSAGE,
    url,
    method: method.toUpperCase(),
    timestamp: Date.now(),
    initiator,
  };
  // The ISOLATED-world content script is the only listener that filters on `source`.
  window.postMessage(message, window.location.origin);
}

function resolveUrl(value: string | URL): string {
  try {
    return new URL(value, window.location.href).toString();
  } catch {
    return String(value);
  }
}

function hookXmlHttpRequest(): void {
  const originalOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function open(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    try {
      report(resolveUrl(url), method, 'xhr');
    } catch {
      // A reporting failure must never break the page's own request.
    }
    return (originalOpen as (...args: unknown[]) => void).call(this, method, url, ...rest);
  };
}

function hookFetch(): void {
  const originalFetch = window.fetch;

  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    try {
      const url = input instanceof Request ? input.url : resolveUrl(input);
      const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
      report(url, method, 'fetch');
    } catch {
      // Same rule as above: observation never breaks the page.
    }
    return originalFetch.call(window, input, init);
  };
}

hookXmlHttpRequest();
hookFetch();
