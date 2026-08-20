# Onboarding — ShowXhrUrl

## Run it in five minutes

```bash
git clone https://github.com/goddivor/show-xhr-url.git
cd show-xhr-url
git checkout v2
npm install
npm run build
```

Then `chrome://extensions/` → developer mode → **Load unpacked** → select `dist/`.
Click the toolbar icon, browse any site, and the panel fills up.

## Read in this order

1. **`README.md`** — what it does, from the outside.
2. **`docs/BRIEF.md`** — who it is for, and what it deliberately does not do.
3. **`docs/STACK.md`** — the versions, and the traps that explain why they are what they are.
4. **`PROJECT-STATE.md`** — where the work currently stands.
5. **`CONTRIBUTING.md`** — the rules a change has to satisfy.

## The one thing to understand first

An extension is **three programs that share no memory**: a service worker, content scripts, and the
side panel. Nearly every bug in this codebase's history came from forgetting which one a file runs
in. `src/shared/` is the only module all three may import, and it deliberately contains nothing but
types and the message contract.

Read `src/shared/messaging.ts` first. It is thirty lines and it describes the whole system.

## Where things are

| You want to change…                   | Go to                                                          |
| ------------------------------------- | -------------------------------------------------------------- |
| what gets captured                    | `src/background/index.ts` and `src/shared/types.ts`            |
| how captures are stored in the worker | `src/background/request-store.ts`                              |
| how `fetch` and XHR are told apart    | `src/content/page-hooks.ts` and `src/background/page-hints.ts` |
| what the panel shows                  | `src/sidepanel/components/`                                    |
| filtering                             | `src/sidepanel/stores/requestStore.ts`                         |
| persistence                           | `src/sidepanel/lib/storage.ts`                                 |
| replay                                | `src/sidepanel/lib/requestSimulator.ts`                        |
| export formats                        | `src/sidepanel/lib/export.ts`                                  |
| permissions, entry points, icons      | `src/manifest.config.ts`                                       |
| colours and semantic classes          | `src/sidepanel/styles/globals.css`                             |

## Commands

```bash
npm run dev        # Vite dev server with hot reload
npm run build      # type-check then build into dist/
npm run check      # type-check + lint + format check — the gate
npm run lint:fix   # autofixable lint problems
npm run format     # Prettier over the repository
```

## Gotchas that will cost you an hour

- **The service worker is evicted after ~30 seconds of inactivity** and loses everything in memory.
  Register listeners at the top level, never inside a callback.
- **After editing a content script, reload the extension _and_ the page.** Reloading only the
  extension leaves the old script running in the open tab.
- **Content-script logs appear in the page's console**, not the worker's. The worker has its own
  DevTools, reachable from `chrome://extensions/`.
- **Icon paths in the manifest are relative to the bundle root.** Vite flattens `public/`, so
  `public/icons/icon16.png` on disk is `icons/icon16.png` in the manifest. Getting this wrong
  produces an extension with no icon and no error.
