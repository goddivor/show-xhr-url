# Handoff — Filtering and search

> **Entry**: `src/sidepanel/stores/requestStore.ts` · **Priority**: P1 · **Context**: Zustand selector

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/components/FilterPanel.tsx` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (Advanced filters, docs/BRIEF.md)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/stores/requestStore.ts`
- **Implementation**: `src/sidepanel/components/FilterPanel.tsx`
- **Runs in**: Zustand selector

## 3. Pieces

**Owns**

- useFilteredRequests selector
- Toolbar method buttons and search box
- FilterPanel: status class, content type, resource type

## 4. States to cover

- no filter
- one filter
- several filters combined
- no match

## 5. Watch-points

- fetch and xhr are not resource types: the browser reports both as xmlhttprequest. They match on the initiator hint instead.
- Filtering is re-derived every render; at 2000 rows behind a virtualiser that is not measurable.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Filtering and search" for ShowXhrUrl (src/sidepanel/stores/requestStore.ts). BEFORE coding, read: work/handoffs/filters.md, the existing implementation in src/sidepanel/components/FilterPanel.tsx, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the Zustand selector. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
