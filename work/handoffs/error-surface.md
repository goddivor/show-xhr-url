# Handoff — Surface errors to the user

> **Entry**: `src/sidepanel/components/Header.tsx` · **Priority**: P1 · **Context**: side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (architecture-review proposal 3)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/components/Header.tsx`
- **Implementation**: `src/sidepanel/`
- **Runs in**: side panel

## 3. Pieces

**Scope**

- An `error` field on the Zustand store
- A status line in the header
- Fed from requestActions and storage failures

## 4. States to cover

- no error
- worker unreachable
- IndexedDB write failed

## 5. Watch-points

- console.error is the entire error strategy today: the panel shows an empty list and the user reads it as "no requests".

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Surface errors to the user" for ShowXhrUrl (src/sidepanel/components/Header.tsx). BEFORE coding, read: work/handoffs/error-surface.md, the existing implementation in src/sidepanel/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
