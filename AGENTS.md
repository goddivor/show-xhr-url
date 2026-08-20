# This is NOT the stack you know

**TypeScript is pinned to 6.0, not 7.0** — TS 7 has no stable compiler API, so typescript-eslint
cannot run on it. `baseUrl` is deprecated; `paths` works without it.
**lucide-react is 1.x** — brand icons removed, some icons renamed.
**Tailwind is v4 configured in CSS** (`@theme` in `globals.css`) — no `tailwind.config.js`, no
PostCSS, no autoprefixer. **ESLint 10 is flat-config only.** **React 19** ships Compiler lint rules.
**Manifest V3**: the service worker is evicted after ~30s, `webRequest` is observe-only, and
MAIN-world code is a _declared_ content script, never an injected inline `<script>`.

Details and sources: `docs/STACK.md`. Verified 2026-08-20 against the npm registry.
