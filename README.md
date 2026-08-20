<div align="center">

<img src="screenshot/logo.png" alt="ShowXhrUrl" title="ShowXhrUrl" width="100"/>

# ShowXhrUrl

[![TypeScript](https://img.shields.io/badge/6.0-blue?logo=typescript&logoColor=fff&label=TypeScript&labelColor=333&color=3178C6&style=flat)](https://www.typescriptlang.org/)
[![Release](https://img.shields.io/github/v/release/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Release&labelColor=333&color=2DA44E&style=flat)](https://github.com/goddivor/show-xhr-url/releases)
[![License](https://img.shields.io/badge/MIT-green?logo=opensourceinitiative&logoColor=fff&label=License&labelColor=333&color=2DA44E&style=flat)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/V3-blue?logo=googlechrome&logoColor=fff&label=Manifest&labelColor=333&color=4285F4&style=flat)](https://developer.chrome.com/docs/extensions/develop/migrate)

[![React](https://img.shields.io/badge/19.2-blue?logo=react&logoColor=fff&label=React&labelColor=333&color=61DAFB&style=flat)](https://react.dev/)
[![Vite](https://img.shields.io/badge/8.2-purple?logo=vite&logoColor=fff&label=Vite&labelColor=333&color=646CFF&style=flat)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/4.3-blue?logo=tailwindcss&logoColor=fff&label=Tailwind%20CSS&labelColor=333&color=06B6D4&style=flat)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/5.0-orange?logo=redux&logoColor=fff&label=Zustand&labelColor=333&color=EF8B2C&style=flat)](https://zustand.docs.pmnd.rs/)
[![idb](https://img.shields.io/badge/8.0-yellow?logo=databricks&logoColor=fff&label=idb&labelColor=333&color=F9A825&style=flat)](https://github.com/jakearchibald/idb)
[![Lucide](https://img.shields.io/badge/1.33-black?logo=lucide&logoColor=fff&label=Lucide&labelColor=333&color=F56565&style=flat)](https://lucide.dev/)

[![Stars](https://img.shields.io/github/stars/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Stars&labelColor=333&color=E3B341&style=flat)](https://github.com/goddivor/show-xhr-url/stargazers)
[![Forks](https://img.shields.io/github/forks/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Forks&labelColor=333&color=8957E5&style=flat)](https://github.com/goddivor/show-xhr-url/forks)
[![Watchers](https://img.shields.io/github/watchers/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Watchers&labelColor=333&color=1F6FEB&style=flat)](https://github.com/goddivor/show-xhr-url/watchers)
[![Contributors](https://img.shields.io/github/contributors/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Contributors&labelColor=333&color=DB61A2&style=flat)](https://github.com/goddivor/show-xhr-url/graphs/contributors)
[![Open issues](https://img.shields.io/github/issues/goddivor/show-xhr-url?logo=github&logoColor=fff&label=Open%20issues&labelColor=333&color=3FB950&style=flat)](https://github.com/goddivor/show-xhr-url/issues)

A **Chrome side panel** that captures every network request a page makes and keeps it in view while
you browse. **Filter** by method, status, content type or initiator, inspect **headers and bodies**,
**replay** any request against the live server, and **export** the result as JSON, HAR, cURL or a
Postman collection.

</div>

---

## 🎖️ Features

- **Side panel, not a popup** - stays open and keeps capturing while you navigate, unlike a popup that closes on every click.
- **Full lifecycle capture** - method, status, headers, request body, response size, server IP, cache hit and duration, correlated on the browser's own request ID.
- **XHR and fetch told apart** - a MAIN-world hook watches the page's own calls, which the network layer reports identically.
- **Request replay** - re-issue any captured request with its original headers, forward the CSRF token, and read the response inline.
- **Advanced filters** - HTTP method, status class, content type, resource type, plus free-text search across URL, referer and origin.
- **Four export formats** - JSON, HAR 1.2, ready-to-paste cURL commands, and Postman v2.1 collections.
- **Survives the service worker** - captures are mirrored to IndexedDB, so closing and reopening the panel does not lose them.
- **Dark and light themes** - follows the system preference, with a manual override that sticks.

## 🖼️ Screenshots

<div align="center">

<table>
<tr>
<td align="center">
<strong>Dark theme</strong><br/>
<img src="screenshot/sidepanel-dark-theme.png" alt="Side panel, dark theme" width="400"/>
</td>
<td align="center">
<strong>Light theme</strong><br/>
<img src="screenshot/sidepanel-light-theme.png" alt="Side panel, light theme" width="400"/>
</td>
</tr>
<tr>
<td align="center">
<strong>Request details and replay</strong><br/>
<img src="screenshot/request-details.png" alt="Request details and replay" width="400"/>
</td>
<td align="center">
<strong>Export options</strong><br/>
<img src="screenshot/export-modal.png" alt="Export options" width="400"/>
</td>
</tr>
</table>

</div>

## 📋 Requirements

- **Chrome 114 or later** (or any Chromium browser with side panel support). `world: "MAIN"` content scripts need Chrome 111+.
- **Node.js 22 or later** to build from source.

## 📦 Installation

The extension is not on the Chrome Web Store; it is loaded unpacked from a local build.

```bash
# 1. Clone the repository and switch to the v2 branch
git clone https://github.com/goddivor/show-xhr-url.git
cd show-xhr-url
git checkout v2

# 2. Install dependencies
npm install

# 3. Build the extension into dist/
npm run build
```

Then, in Chrome:

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## ⚙️ Usage

1. Click the ShowXhrUrl toolbar icon to open the side panel.
2. Browse any website - requests appear as they happen, and the toolbar badge counts them.
3. Narrow the list with the method buttons, the search box, or the **Filter** button for status, content type and resource type.
4. Click a request to open its details: general information, request headers, response headers.
5. Press **Fetch** to replay it against the live server and read the response inline.
6. Use the download button in the header to export the current list.

### 🎨 Theme

The panel follows your system colour scheme. The sun and moon button in the header pins it to light
or dark, and the choice is remembered.

### 🧹 Clearing

The trash button clears the current tab everywhere at once: the service worker's memory, the
IndexedDB mirror and the panel. Captures older than 24 hours are pruned automatically.

## 🧱 Architecture

An extension is three programs that share no memory. This one keeps them explicitly separated, with
a single shared contract between them.

```
src/
├── shared/            # types + message contract, imported by all three contexts
├── background/        # service worker: the only code that touches chrome.webRequest
│   ├── request-store.ts   # per-tab capture index, keyed by the browser's requestId
│   ├── page-hints.ts      # correlates the page-level hook with the network events
│   └── headers.ts         # header and content-length parsing
├── content/
│   ├── page-hooks.ts      # MAIN world: patches fetch and XMLHttpRequest
│   └── index.ts           # ISOLATED world: relays to the service worker
├── sidepanel/         # React application
│   ├── components/        # UI, including a virtualised request list
│   ├── hooks/             # useRequestSync, useTheme
│   ├── lib/               # storage, export, replay, chrome messaging
│   ├── stores/            # Zustand store and selectors
│   └── styles/            # Tailwind v4 theme, configured in CSS
└── manifest.config.ts # the manifest, in TypeScript, checked against the real files
```

## 🛠️ Development

```bash
# Development server with hot reload
npm run dev

# Production build into dist/
npm run build

# Type-check only
npm run typecheck

# Lint, and lint with autofix
npm run lint
npm run lint:fix

# Format with Prettier
npm run format

# The full gate: types, lint and formatting
npm run check
```

## 🤝 Contributing

Contributions are welcome. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first - it covers the branch
policy, the commit format and the checks a change has to pass. Security issues go through
[`SECURITY.md`](SECURITY.md) rather than a public issue.

## 📜 License

Released under the [MIT License](LICENSE).
