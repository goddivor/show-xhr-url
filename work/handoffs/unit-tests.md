# Handoff — Unit tests for the pure modules

> **Entry**: `vitest` · **Priority**: P0 · **Context**: Vitest

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `src/background/request-store.ts, src/background/page-hints.ts, src/sidepanel/lib/export.ts` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (architecture-review proposal 1)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `vitest`
- **Implementation**: `src/background/request-store.ts, src/background/page-hints.ts, src/sidepanel/lib/export.ts`
- **Runs in**: Vitest

## 3. Pieces

**Scope**

- request-store: eviction order, merge on unknown id, per-tab isolation
- page-hints: TTL expiry, one hint consumed per matching request, ordering
- export: all four formats against a fixed input

**Explicitly out**

- No component tests, no DOM, no extension harness - they need a browser and cost more than they return at this size.

## 4. States to cover

- n/a

## 5. Watch-points

- There is no test of any kind today. These three modules are pure functions of their input, which is exactly where a silent regression is invisible.
- Add a `test` script and fold it into `npm run check`.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "Unit tests for the pure modules" for ShowXhrUrl (vitest). BEFORE coding, read: work/handoffs/unit-tests.md, the existing implementation in src/background/request-store.ts, src/background/page-hints.ts, src/sidepanel/lib/export.ts, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the Vitest. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
