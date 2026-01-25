# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ShowXhrUrl is a Chrome extension (Manifest V3) that monitors and displays all XHR/fetch requests made by web pages. It provides a popup interface to visualize, filter, and test these requests in real-time. The extension also integrates with OpenAI's API to simplify JSON responses.

## Commands

```bash
# Development with hot reload
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Extension Components (Manifest V3)

- **Background Service Worker** (`src/background/index.ts`): Captures all network requests using `chrome.webRequest` API. Stores requests per tab with headers, status codes, and metadata. Communicates with popup via message passing.

- **Content Script** (`src/content/index.ts`): Injects a script into web pages to intercept `XMLHttpRequest.open` and `window.fetch` calls directly. Sends captured data to background via `postMessage`.

- **Popup** (`src/popup/index.ts` + `index.html`): UI for viewing captured requests. Features filtering by HTTP method, search, and a "Fetch" button to re-execute GET requests with CSRF tokens. Includes ChatGPT integration for JSON simplification.

### Message Flow

1. `webRequest` API captures requests in background -> stored in `detailedRequests[tabId]`
2. Content script intercepts XHR/fetch at page level -> sends via `postMessage` -> stores in `chrome.storage.local`
3. Popup sends `GET_DETAILED_REQUESTS` message -> background responds with stored requests
4. Badge shows request count per tab

### Path Aliases

Configured in `vite.config.ts`:
- `@` -> `./src`
- `@utils` -> `./src/utils`

### Browser Compatibility

`src/utils/browser.ts` provides a cross-browser wrapper that uses `chrome` API when available (defaults for Chrome extensions).

## Environment Variables

Required for ChatGPT JSON simplification feature (optional):

```
VITE_CHATGPT_API_KEY=
VITE_CHATGPT_SPECIAL_PROMPT=
VITE_OPENAI_API_URL=
VITE_OPENAI_MODEL=
VITE_OPENAI_MAX_TOKENS=
VITE_OPENAI_TEMPERATURE=
```

## Loading the Extension in Chrome

1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder
