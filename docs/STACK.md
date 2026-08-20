# STACK — ShowXhrUrl

Every version below was checked against the npm registry on **2026-08-20**, not recalled.
Re-verify with `npm view <pkg> version` before quoting any of them as current.

## Pinned versions

| Package                             | Version    | Why this one                                                               |
| ----------------------------------- | ---------- | -------------------------------------------------------------------------- |
| `typescript`                        | `~6.0.3`   | **Not 7.0.** See the trap below.                                           |
| `react` / `react-dom`               | `^19.2.8`  | Current stable. The React Compiler lint rules ship with it.                |
| `vite`                              | `^8.2.2`   | Current stable.                                                            |
| `@vitejs/plugin-react`              | `^6.1.0`   | Matches Vite 8.                                                            |
| `vite-plugin-web-extension`         | `^4.5.1`   | Handles MV3 bundling: ESM worker, IIFE content scripts, manifest emission. |
| `tailwindcss` + `@tailwindcss/vite` | `^4.3.3`   | v4 runs as a Vite plugin; no PostCSS, no autoprefixer.                     |
| `zustand`                           | `^5.0.15`  | Panel-local UI state.                                                      |
| `idb`                               | `^8.0.3`   | Typed IndexedDB wrapper for the durable mirror.                            |
| `@tanstack/react-virtual`           | `^3.14.10` | Virtualised request list.                                                  |
| `lucide-react`                      | `^1.33.0`  | v1 dropped brand icons; all 17 icons used here survived.                   |
| `@types/chrome`                     | `^0.2.6`   | Real `chrome.*` types, which replaced ~50 hand-written interfaces.         |
| `eslint`                            | `^10.8.1`  | Flat config only; `.eslintrc.*` does not work.                             |
| `typescript-eslint`                 | `^8.67.0`  | Type-aware linting across the whole project.                               |
| Node                                | `>=22`     | Declared in `engines`.                                                     |

## Traps

### TypeScript stays on 6.0, not 7.0

TypeScript 7.0 reached general availability on 2026-07-08 — a full rewrite of the compiler in Go,
roughly 10x faster. **It cannot be used here.** 7.0 ships without a stable programmatic compiler API;
that API is expected in 7.1. `typescript-eslint@8.67.0` declares
`"typescript": ">=4.8.4 <6.1.0"`, and its TS 7 support request was closed as not planned.

Choosing 7.0 means losing type-aware linting entirely, which is where this project's real bug-catching
lives. **Revisit when TypeScript 7.1 ships and typescript-eslint declares support** — not before.

Sources: [InfoQ, TypeScript 7.0 release](https://www.infoq.com/news/2026/08/typescript-7-released/) ·
[Why Angular, Vue and ESLint can't upgrade yet](https://dev.to/the-modern-web/why-angular-vue-and-eslint-cant-upgrade-to-typescript-70-yet-and-why-ts-71-changes-441g)
· `npm view typescript-eslint@8.67.0 peerDependencies`

### `baseUrl` is gone

TypeScript 6 deprecates `compilerOptions.baseUrl` and 7 removes it. `paths` resolves relative to the
tsconfig without it. Do not add it back to silence a resolution problem.

### lucide-react 1.0 dropped every brand icon

Trademarked logos (GitHub, Figma, Slack…) were removed in v1, and some icons were renamed. If an
import fails with _has no exported member_, the icon was renamed — check
[the v1 guide](https://lucide.dev/guide/version-1) rather than pinning back to 0.x.
Source: [InfoQ, Lucide 1.0](https://www.infoq.com/news/2026/06/lucide-v1-icons/)

### Tailwind v4 is configured in CSS

`@theme` in `src/sidepanel/styles/globals.css` is the whole configuration. There is no
`tailwind.config.js` and no `postcss.config.js`; v4 does its own vendor prefixing through Lightning
CSS, so `autoprefixer` is dead weight. Both files existed in v1 alongside `@theme`, giving the palette
two sources of truth that had already drifted.

### The Firefox runner is where the advisories live

`vite-plugin-web-extension` depends on `web-ext-run`, which pulls in `firefox-profile`, `fx-runner`
and `node-notifier`. Every advisory this project has ever had came from that chain, and none of it
runs in a Chrome-only workflow. It is pinned through `overrides` in `package.json`
(`shell-quote`, `adm-zip`, `uuid`, `tmp`, `fast-uri`). `npm audit` reports **0 vulnerabilities**.
Do not remove those overrides without re-running the audit.

## Rejected alternatives

| Considered                                                    | Rejected because                                                                                                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript 7.0                                                | No stable compiler API; kills type-aware linting. Revisit at 7.1.                                                                                              |
| Hand-rolled Vite MV3 build (drop `vite-plugin-web-extension`) | Would remove ~200 packages, but means maintaining a two-format build (ESM worker, IIFE content scripts) plus manifest emission. The overrides cost five lines. |
| `@crxjs/vite-plugin`                                          | Not evaluated in depth; switching build plugins is a project-sized change, not a cleanup.                                                                      |
| `webextension-polyfill`                                       | Removed as unused. Only worth reinstating if Firefox becomes a target.                                                                                         |
| `axios`                                                       | Removed with the v1 popup. The replay path uses `fetch`, which needs no dependency and supports `AbortController` natively.                                    |
| `@types/axios`                                                | A deprecated stub; axios ships its own types. It existed alongside a hand-written `src/types/axios.d.ts` that shadowed them.                                   |
| `chrome.storage.local` for the mirror                         | Too small. A busy page produces tens of megabytes of headers and bodies.                                                                                       |
