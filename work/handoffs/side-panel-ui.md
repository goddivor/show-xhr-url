# Handoff — Side panel UI

> **Entry**: `src/sidepanel/index.html` · **Priority**: P0 · **Context**: React 19 side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (Features section of docs/BRIEF.md)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/index.html`
- **Implementation**: `src/sidepanel/`
- **Runs in**: React 19 side panel

## 3. Pieces

**Components**

- Header, Toolbar, FilterPanel, RequestList (virtualised), RequestItem, RequestDetails, ResponseViewer, ExportModal
- ui/ - Badge, Button, Input

**State**

- stores/requestStore.ts - Zustand, plus the useFilteredRequests selector
- hooks/useRequestSync.ts - mounted once, owns the chrome listeners
- hooks/useTheme.ts - useSyncExternalStore over the media query

## 4. States to cover

- loading
- empty (no requests captured)
- populated
- a request selected

## 5. Watch-points

- Subscribe with narrow selectors; the panel re-renders on every broadcast.
- useRequestSync must be mounted exactly once, at the root.
- Theme is painted in main.tsx before React mounts, to avoid a wrong-palette frame.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Side panel UI" for ShowXhrUrl (src/sidepanel/index.html). BEFORE coding, read: work/handoffs/side-panel-ui.md, the existing implementation in src/sidepanel/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the React 19 side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
