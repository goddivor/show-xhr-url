# Handoff — Type the HAR and Postman output

> **Entry**: `src/sidepanel/lib/export.ts` · **Priority**: P2 · **Context**: side panel

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/sidepanel/lib/export.ts` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (architecture-review proposal 5)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `src/sidepanel/lib/export.ts`
- **Implementation**: `src/sidepanel/lib/export.ts`
- **Runs in**: side panel

## 3. Pieces

**Scope**

- Interfaces for HAR 1.2 and Postman v2.1 in src/sidepanel/lib/
- Build the literals against them

## 4. States to cover

- n/a

## 5. Watch-points

- A missing required field currently only shows up when the exported file is opened in another tool.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Type the HAR and Postman output" for ShowXhrUrl (src/sidepanel/lib/export.ts). BEFORE coding, read: work/handoffs/typed-export-schemas.md, the existing implementation in src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the side panel. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
