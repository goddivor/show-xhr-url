# Handoff — CI on push and pull request

> **Entry**: `.github/workflows/ci.yml` · **Priority**: P0 · **Context**: GitHub Actions

## 1. Read BEFORE coding (mandatory)

- 📍 **State**: [`../../PROJECT-STATE.md`](../../PROJECT-STATE.md) — what exists, what is decided
- 💻 **Reference**: the existing implementation, `.github/workflows/` — match its conventions
- 📐 **Spec**: `docs/BRIEF.md` (architecture-review proposal 2)
- ⚠️ **Traps**: `docs/STACK.md` — check the APIs this unit uses
- 🛠️ **Skills**: `build-a-feature`, `showxhr-conventions`, `extension-architecture`

## 2. Entry & files

- **Entry**: `.github/workflows/ci.yml`
- **Implementation**: `.github/workflows/`
- **Runs in**: GitHub Actions

## 3. Pieces

**Scope**

- Node 22, npm ci, npm run check, npm run build
- Triggered on push to v2 and on pull_request

## 4. States to cover

- n/a

## 5. Watch-points

- Dependabot already opens PRs here and nothing tells anyone whether one breaks the build.
- Do not run it on v1; that branch is frozen.

## 6. Definition of Done

- [ ] Consistent with the surrounding code and with `showxhr-conventions`
- [ ] All states in §4 are handled
- [ ] English only, no `any`, no new eslint-disable, no relaxed tsconfig flag
- [ ] `npm run check && npm run build` passes
- [ ] Unpacked build reloads with no service-worker error, badge counts, panel lists
- [ ] `PROJECT-STATE.md` refreshed and INDEX status set to `✅ done`

## 7. Start prompt (paste to Claude Code)

```
Build "CI on push and pull request" for ShowXhrUrl (.github/workflows/ci.yml). BEFORE coding, read: work/handoffs/ci-pipeline.md, the existing implementation in .github/workflows/, and the build-a-feature skill (+ showxhr-conventions). Follow the three-context separation (background / content / sidepanel, shared contract in src/shared); this unit lives in the GitHub Actions. English only, no `any`, no new eslint-disable, no relaxed tsconfig flag. Finish with: npm run check && npm run build, then reload the unpacked build and confirm it works. Then refresh PROJECT-STATE.md and set this unit to done in work/INDEX.md.
```
