# DECISIONS

Append-only. One line each, newest at the bottom.
Format: `- YYYY-MM-DD — <decision> — <why>`
Never rewrite a line. A reversal is a new line referencing the original's date.

- 2026-08-20 — Work only on `v2`; `v1` is frozen — v1 is the shipped popup version, kept for reference
- 2026-08-20 — Delete every v1 leftover (popup, counter, root manifest, root index.html) — dead code the build never referenced
- 2026-08-20 — Correlate captures on `requestId`, not URL — same-URL requests mixed up each other's headers
- 2026-08-20 — One `DetailedRequest` in `src/shared/types.ts` — worker and panel copies had already diverged
- 2026-08-20 — Messages are a typed union with runtime guards — unhandled message types failed silently
- 2026-08-20 — MAIN-world hook is a declared content script — inline script injection is blocked by strict CSP
- 2026-08-20 — Drop `src/utils/browser.ts` for direct `chrome.*` — the wrapper typed the whole worker as `any`
- 2026-08-20 — Drop the `storage` and `cookies` permissions — nothing used them after the v1 popup was removed
- 2026-08-20 — Keep `clipboardWrite` — the copy buttons call `navigator.clipboard` from an extension page
- 2026-08-20 — Coalesce broadcasts on a 120 ms timer — per-event sends flooded the port on busy pages
- 2026-08-20 — Cap the worker store per tab and prune IndexedDB after 24h — both grew without bound
- 2026-08-20 — Pin TypeScript to 6.0, not 7.0 — TS 7 has no stable compiler API, typescript-eslint cannot support it
- 2026-08-20 — Enable `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` — each caught real defects; declare `?: T | undefined` rather than relaxing them
- 2026-08-20 — Disable `no-confusing-void-expression` project-wide — it fights the documented Zustand setter idiom
- 2026-08-20 — Disable `unbound-method` in `page-hooks.ts` only — capturing the original unbound is the point of a monkey patch
- 2026-08-20 — Tailwind configured in CSS only; delete `tailwind.config.js` and `postcss.config.js` — two sources of truth for the palette had drifted
- 2026-08-20 — Keep `vite-plugin-web-extension`, pin its transitive advisories via `overrides` — replacing it means maintaining a two-format MV3 build
- 2026-08-20 — Close all five Dependabot PRs as superseded, delete their branches — the wholesale upgrade went past every one of them
- 2026-08-20 — Gitignore `CLAUDE.md` and `.claude/` — user decision; the assistant context layer stays local
- 2026-08-20 — Add the missing `LICENSE` file — `package.json` and the README both claimed MIT with no licence text in the repository
