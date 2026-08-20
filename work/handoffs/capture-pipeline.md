# Handoff — Capture pipeline

> **Entry**: `src/background/index.ts` · **Priority**: P0 · **Context**: service worker

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/background/` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (the one thing it must do: never lose a request)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/background/index.ts`
- **Implementation**: `src/background/`
- **Runs in**: service worker

## 3. Pieces

**Owns**

- request-store.ts - per-tab index keyed by requestId, FIFO eviction
- page-hints.ts - XHR/fetch correlation, 10s TTL
- headers.ts, request-body.ts - decoding

**Contract**

- src/shared/types.ts - DetailedRequest
- src/shared/messaging.ts - the message union and its guards

## 4. States to cover

- pending (no onCompleted yet, normal for a long-poll)
- complete
- failed (onErrorOccurred fires instead of onCompleted)

## 5. Watch-points

- Five webRequest events, one requestId. Never correlate on URL.
- tabId is -1 for requests with no owning tab; drop those.
- Broadcasts are coalesced on a 120ms timer; never send per event.
- The worker is evicted after ~30s and loses everything in memory.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Capture pipeline" for ShowXhrUrl (src/background/index.ts). BEFORE coding, read: work/handoffs/capture-pipeline.md, the existing implementation in src/background/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the service worker. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
