# PROJECT-STATE

> Live state, not history. **Max 80 lines.** Rewrite in place — never append.
> History: `git log`. Decisions: `docs/DECISIONS.md`. Spec: `docs/BRIEF.md`.
> Last updated: 2026-08-20

## Now

v2 overhaul landed — dependencies, architecture, tooling and docs are done; nothing is blocking, and
the queue's next items are tests and CI, neither of which exists yet.

## Shape

A Manifest V3 Chromium extension: a **side panel** that captures every network request the current
tab makes and keeps it in view while you browse. Three programs that share no memory — a **service
worker** that owns `chrome.webRequest` and the canonical capture record, **two content scripts**
(one in the page's MAIN world patching `fetch` and `XMLHttpRequest`, one in the ISOLATED world
relaying to the worker), and a **React side panel** that renders, filters, replays and exports.
`src/shared/` holds the only types and messages all three may import.

The invariant that everything else serves: **never lose a request.** Captures are correlated on the
browser's `requestId`, evicted FIFO rather than refused, and mirrored to IndexedDB because the
service worker is evicted after roughly thirty seconds and loses everything in memory.

It observes and never modifies — MV3 removed blocking `webRequest`, and that limitation is a
deliberate part of the product, not a gap.

## Done

- [x] Capture pipeline — five webRequest events folded into one record per `requestId`, FIFO cap per tab, 120 ms coalesced broadcast. No response bodies: `webRequest` does not expose them.
- [x] XHR/fetch discrimination — MAIN-world hook, declared content script, 10 s best-effort correlation. A wrong label costs a filter chip, never a capture.
- [x] Side panel — virtualised list, details with headers, replay, export modal, dark/light theme. No error surface: failures only reach the console.
- [x] Persistence — IndexedDB mirror, 24 h retention pruned on mount. Retention was chosen, never measured.
- [x] Export — JSON, HAR 1.2, cURL, Postman v2.1. HAR and Postman are untyped literals.
- [x] Replay — `fetch` with `AbortController`, 30 s timeout, CSRF forwarding. Sends no credentials, so authenticated endpoints replay as anonymous.
- [x] Tooling — ESLint 10 type-aware over the whole project, Prettier, strict tsconfig, all behind `npm run check`. Zero errors.
- [x] Dependencies — everything on current releases, TypeScript held at 6.0, `npm audit` reports 0 vulnerabilities, five Dependabot PRs closed as superseded.
- [x] Docs and context layer — README, CONTRIBUTING, LICENSE, `docs/`, `work/`, eight skills.

## Next

1. **unit-tests** — Vitest over `request-store`, `page-hints`, `export`. Nothing is tested today.
2. **ci-pipeline** — `npm run check && npm run build` on push and PR, Node 22.
3. **error-surface** — a status line in the header, so a swallowed failure stops reading as "no requests".

## Watch

- **No tests of any kind.** The three pure modules are exactly where a silent regression is invisible.
- **Nothing runs the check on push.** Dependabot opens PRs here with no signal on whether they build.
- **Replay sends no credentials** — an authenticated endpoint replays as anonymous. Fixing it needs the `cookies` permission back; undecided, see `docs/BRIEF.md`.
- **`react-hooks/incompatible-library` warns on `useVirtualizer`** — upstream, informational, accepted. Do not restructure the list to silence it.
- **TypeScript must stay on 6.0** until typescript-eslint supports 7.x. Upgrading kills type-aware linting.

## Resume

Read in order: `CLAUDE.md` → `docs/BRIEF.md` → this file → `work/handoffs/unit-tests.md`
Validate with: `npm run check && npm run build`, then reload the unpacked build from `dist/`
