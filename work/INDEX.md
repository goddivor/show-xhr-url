# Feature index — ShowXhrUrl

Each feature has a **handoff** (what to read, pieces, states, definition of done, start prompt).
Generated — edit `_generate-units.mjs`, not this file.
**The Status column is the exception**: it is hand-updated and preserved across regenerations.

> Before building: read the handoff, then follow the `build-a-feature` skill.

## Features

| Prio | Feature | Entry | Links | Context | Status |
| --- | --- | --- | --- | --- | --- |
| P0 | **Capture pipeline** | `src/background/index.ts` | [handoff](./handoffs/capture-pipeline.md) | service worker | ✅ done |
| P0 | **Side panel UI** | `src/sidepanel/index.html` | [handoff](./handoffs/side-panel-ui.md) | React 19 side panel | ✅ done |
| P1 | **Filtering and search** | `src/sidepanel/stores/requestStore.ts` | [handoff](./handoffs/filters.md) | Zustand selector | ✅ done |
| P1 | **Request replay** | `src/sidepanel/lib/requestSimulator.ts` | [handoff](./handoffs/request-replay.md) | side panel | ✅ done |
| P1 | **Export formats** | `src/sidepanel/lib/export.ts` | [handoff](./handoffs/export-formats.md) | side panel | ✅ done |
| P0 | **Unit tests for the pure modules** | `vitest` | [handoff](./handoffs/unit-tests.md) | Vitest | ⬜ todo |
| P0 | **CI on push and pull request** | `.github/workflows/ci.yml` | [handoff](./handoffs/ci-pipeline.md) | GitHub Actions | ⬜ todo |
| P1 | **Surface errors to the user** | `src/sidepanel/components/Header.tsx` | [handoff](./handoffs/error-surface.md) | side panel | ⬜ todo |
| P2 | **Split RequestDetails into panes** | `src/sidepanel/components/RequestDetails.tsx` | [handoff](./handoffs/split-request-details.md) | side panel | ⬜ todo |
| P2 | **Type the HAR and Postman output** | `src/sidepanel/lib/export.ts` | [handoff](./handoffs/typed-export-schemas.md) | side panel | ⬜ todo |

Status vocabulary: `⬜ todo` · `🟡 in progress` · `✅ done` · `🚫 dropped`
Declare an abandoned unit with `dropped: "reason"` in the array, never by editing this file.

## Suggested order

1. **P0** — Capture pipeline · Side panel UI · Unit tests for the pure modules · CI on push and pull request
2. **P1** — Filtering and search · Request replay · Export formats · Surface errors to the user
3. **P2** — Split RequestDetails into panes · Type the HAR and Postman output

The done rows describe what already exists; their handoffs document the shipped behaviour and its
watch-points, and are the reference for editing them. The ranked reasoning behind the todo rows is
in the `architecture-review` skill.

## Regenerate

```bash
node work/_generate-units.mjs
```
