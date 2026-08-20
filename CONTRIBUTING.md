# Contributing to ShowXhrUrl

## Branches

- **`v2` is the active branch** and the default. All work happens here.
- **`v1` is frozen.** It is the original popup-based version, kept for reference. Do not commit to
  it, do not merge into it, do not delete it.
- Feature work branches off `v2` and merges back into `v2`.

## Language

**Everything in this repository is in English** — identifiers, comments, UI strings, commit
messages, branch names, issue and pull-request text, documentation. There are no exceptions.

A comment that explains a workaround must still explain it after translation; never delete a comment
instead of translating it.

## Commits

Conventional commits, imperative mood, English:

```
type(scope): description
```

- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`
- Imperative: `add`, `update`, `fix` — never `added`, `adding`
- Stage files by name. Never `git add .` or `git add -A`.
- Never commit `.env*`, credentials, keys or certificates.
- **Never attribute a commit to an AI** — no assistant name, no co-author trailer, no
  "Generated with" line, anywhere.

## Before you open a pull request

```bash
npm run check    # type-check, lint, format — all three must be clean
npm run build    # must succeed
```

Then load the build unpacked and confirm it actually works:

1. `chrome://extensions/`, developer mode on, **Load unpacked**, select `dist/`
2. Browse a normal page: the toolbar badge counts requests
3. Open the side panel: the requests are listed
4. Check the service worker's own DevTools for errors

A green `npm run check` proves the code compiles. It proves nothing about the extension.

## Code rules that reviewers will enforce

- No `any`. Use `unknown` plus a narrowing check, or extend the type in `src/shared/types.ts`.
- No `eslint-disable` to make an error go away. If a rule is wrong for this project, change
  `eslint.config.mjs`, scope it, and record it in `docs/DECISIONS.md`.
- No relaxing a `tsconfig.json` strict flag. Each one is there because it caught a real defect.
- No new permission in `src/manifest.config.ts` without a comment saying which feature needs it.
- No module in `src/shared/` that touches `window`, `document` or `chrome` — all three contexts
  import it.
- No `chrome.runtime` call from inside a React component; those go through `src/sidepanel/lib/`.

## Documentation

- A decision that future contributors should not re-litigate goes in `docs/DECISIONS.md`, one line.
- A version, a trap, or a rejected alternative goes in `docs/STACK.md` **with its source**.
- What the product is and is not goes in `docs/BRIEF.md`.
- `PROJECT-STATE.md` is where the project currently stands; rewrite it in place, never append.

## Security

Do not open a public issue for a security problem. Follow [`SECURITY.md`](SECURITY.md).
