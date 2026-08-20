# Handoff — Request replay

> **Entry**: `src/sidepanel/lib/requestSimulator.ts` · **Priority**: P1 · **Context**: side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/lib/requestSimulator.ts` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (Request replay, docs/BRIEF.md)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/lib/requestSimulator.ts`
- **Implementation**: `src/sidepanel/lib/requestSimulator.ts`
- **Runs in**: side panel

## 3. Pieces

**Owns**

- simulateRequest with AbortController and a 30s timeout
- CSRF token extraction and header forwarding
- ResponseViewer for the result

## 4. States to cover

- idle
- in flight (cancellable)
- succeeded
- failed
- cancelled or timed out

## 5. Watch-points

- Replay is a second, separate request. It is not the original response.
- Credentials are not sent, so an authenticated endpoint replays as anonymous. Open question in docs/BRIEF.md.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Request replay" for ShowXhrUrl (src/sidepanel/lib/requestSimulator.ts). BEFORE coding, read: work/handoffs/request-replay.md, the existing implementation in src/sidepanel/lib/requestSimulator.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
