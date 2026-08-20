# Handoff — Split RequestDetails into panes

> **Entry**: `src/sidepanel/components/RequestDetails.tsx` · **Priority**: P2 · **Context**: side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/components/details/` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (architecture-review proposal 4)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/components/RequestDetails.tsx`
- **Implementation**: `src/sidepanel/components/details/`
- **Runs in**: side panel

## 3. Pieces

**Scope**

- Extract GeneralInfo, HeadersTable and the simulation pane into components/details/

## 4. States to cover

- n/a

## 5. Watch-points

- 228 lines doing four things - the only file in the codebase doing more than one. Readable today; do it when the next tab is added.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Split RequestDetails into panes" for ShowXhrUrl (src/sidepanel/components/RequestDetails.tsx). BEFORE coding, read: work/handoffs/split-request-details.md, the existing implementation in src/sidepanel/components/details/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
