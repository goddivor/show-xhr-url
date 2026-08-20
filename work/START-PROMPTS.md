# Start prompts — one feature at a time

Copy a block into Claude Code. Each prompt forces reading the handoff and the skills before coding,
and closing the context loop after.

## Capture pipeline — `src/background/index.ts` (P0) — ✅ done

```
Build "Capture pipeline" for ShowXhrUrl (src/background/index.ts). BEFORE coding, read: work/handoffs/capture-pipeline.md, the existing implementation in src/background/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the service worker. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Side panel UI — `src/sidepanel/index.html` (P0) — ✅ done

```
Build "Side panel UI" for ShowXhrUrl (src/sidepanel/index.html). BEFORE coding, read: work/handoffs/side-panel-ui.md, the existing implementation in src/sidepanel/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the React 19 side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Filtering and search — `src/sidepanel/stores/requestStore.ts` (P1) — ✅ done

```
Build "Filtering and search" for ShowXhrUrl (src/sidepanel/stores/requestStore.ts). BEFORE coding, read: work/handoffs/filters.md, the existing implementation in src/sidepanel/components/FilterPanel.tsx, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the Zustand selector. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Request replay — `src/sidepanel/lib/requestSimulator.ts` (P1) — ✅ done

```
Build "Request replay" for ShowXhrUrl (src/sidepanel/lib/requestSimulator.ts). BEFORE coding, read: work/handoffs/request-replay.md, the existing implementation in src/sidepanel/lib/requestSimulator.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Export formats — `src/sidepanel/lib/export.ts` (P1) — ✅ done

```
Build "Export formats" for ShowXhrUrl (src/sidepanel/lib/export.ts). BEFORE coding, read: work/handoffs/export-formats.md, the existing implementation in src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Unit tests for the pure modules — `vitest` (P0) — ⬜ todo

```
Build "Unit tests for the pure modules" for ShowXhrUrl (vitest). BEFORE coding, read: work/handoffs/unit-tests.md, the existing implementation in src/background/request-store.ts, src/background/page-hints.ts, src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the Vitest. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## CI on push and pull request — `.github/workflows/ci.yml` (P0) — ⬜ todo

```
Build "CI on push and pull request" for ShowXhrUrl (.github/workflows/ci.yml). BEFORE coding, read: work/handoffs/ci-pipeline.md, the existing implementation in .github/workflows/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the GitHub Actions. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Surface errors to the user — `src/sidepanel/components/Header.tsx` (P1) — ⬜ todo

```
Build "Surface errors to the user" for ShowXhrUrl (src/sidepanel/components/Header.tsx). BEFORE coding, read: work/handoffs/error-surface.md, the existing implementation in src/sidepanel/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Split RequestDetails into panes — `src/sidepanel/components/RequestDetails.tsx` (P2) — ⬜ todo

```
Build "Split RequestDetails into panes" for ShowXhrUrl (src/sidepanel/components/RequestDetails.tsx). BEFORE coding, read: work/handoffs/split-request-details.md, the existing implementation in src/sidepanel/components/details/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```

## Type the HAR and Postman output — `src/sidepanel/lib/export.ts` (P2) — ⬜ todo

```
Build "Type the HAR and Postman output" for ShowXhrUrl (src/sidepanel/lib/export.ts). BEFORE coding, read: work/handoffs/typed-export-schemas.md, the existing implementation in src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
