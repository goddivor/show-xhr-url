# BRIEF — ShowXhrUrl

## What it is

A Chromium extension that shows, in a side panel, every network request the page in front of you is
making — and lets you inspect, replay and export any of them without leaving the page.

## Who it is for

Developers and testers who need to see a page's traffic while continuing to interact with the page.
DevTools does this, but it takes half the screen, resets its own layout, and cannot be kept open
alongside a narrow app window. The side panel is the whole point: it docks, it stays, and closing it
does not lose what was captured.

The second audience is people reverse-engineering an undocumented API on a site they use — capture
the call, read the headers, replay it with the CSRF token, export it as cURL or a Postman collection.

## The one thing it must do

**Never lose a request.** Everything else is secondary. A monitor that silently drops captures is
worse than no monitor, because it produces false confidence. This is why requests are correlated on
the browser's `requestId`, why the store evicts FIFO rather than refusing writes, and why captures
are mirrored to IndexedDB the moment they arrive.

## In scope

- Observing requests: URL, method, headers, request body, status, size, IP, cache, duration
- Distinguishing `fetch` from `XMLHttpRequest`, which the network layer reports identically
- Filtering: method, status class, content type, resource type, free-text search
- Replaying a captured request and reading the response inline
- Exporting: JSON, HAR 1.2, cURL, Postman v2.1
- Dark and light themes following the system preference

## Out of scope — deliberately

- **Modifying or blocking requests.** Manifest V3 removed blocking `webRequest`; the alternative,
  `declarativeNetRequest`, cannot report back to a UI. This extension observes and nothing else.
- **Response bodies from the network.** `webRequest` does not expose them. Replay is the answer, and
  it is honest about being a second, separate request.
- **Firefox and Safari.** Chromium only, until someone decides otherwise. That decision changes the
  manifest, the polyfill situation and the MAIN-world hook.
- **Cross-device sync, accounts, telemetry.** Nothing leaves the machine.
- **Being DevTools.** No waterfall, no timing breakdown, no protocol view.

## Constraints

- Manifest V3, with everything that follows: service-worker eviction, world isolation, observe-only
  networking.
- Loaded unpacked. Not published to the Chrome Web Store, so the install path is `npm run build`
  plus **Load unpacked**.
- No backend, no network calls of its own except the ones the user explicitly replays.
- Everything in the repository is in English.

## Open questions

- Should replay send cookies? It currently does not set `credentials`, so an authenticated endpoint
  replays as anonymous. Fixing this needs the `cookies` permission back, which widens the install
  warning. **Undecided.**
- Is the 24-hour IndexedDB retention right? Chosen as a reasonable default, never measured against
  real use.
