# Handoff — Export formats

> **Entry**: `src/sidepanel/lib/export.ts` · **Priority**: P1 · **Context**: side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/lib/export.ts` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (Four export formats, docs/BRIEF.md)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/lib/export.ts`
- **Implementation**: `src/sidepanel/lib/export.ts`
- **Runs in**: side panel

## 3. Pieces

**Owns**

- JSON
- HAR 1.2
- cURL command lines
- Postman v2.1 collection
- ExportModal

## 4. States to cover

- nothing to export (button disabled)
- export with headers
- export without headers

## 5. Watch-points

- HAR and Postman are built as untyped object literals; a missing required field only shows up in the consuming tool. See unit typed-export-schemas.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Export formats" for ShowXhrUrl (src/sidepanel/lib/export.ts). BEFORE coding, read: work/handoffs/export-formats.md, the existing implementation in src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
