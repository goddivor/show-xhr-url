/**
 * The extension manifest, kept in TypeScript so the entry-point paths are checked against
 * the real files and so the reason for each permission stays next to the permission.
 *
 * `vite-plugin-web-extension` reads this, bundles every referenced entry point and emits
 * the final `manifest.json` with the built paths substituted in.
 */

import pkg from '../package.json' with { type: 'json' };

const manifest = {
  manifest_version: 3,
  name: 'ShowXhrUrl',
  version: pkg.version,
  description: 'Monitor, filter, replay and export every network request a page makes.',

  permissions: [
    // Observing the request lifecycle. Never used in blocking mode.
    'webRequest',
    // Resolving the active tab so captures stay scoped to what the user is looking at.
    'tabs',
    // Opening the panel from the toolbar icon.
    'sidePanel',
    // The copy buttons use navigator.clipboard, which an extension page may only call
    // without a user gesture when this is granted.
    'clipboardWrite',
  ],

  // webRequest reports nothing without host access to the origins being watched.
  host_permissions: ['<all_urls>'],

  // Paths are relative to the bundle root: Vite copies the contents of `public/` there,
  // so `public/icons/icon16.png` on disk ships as `icons/icon16.png`.
  icons: {
    16: 'icons/icon16.png',
    48: 'icons/icon48.png',
    128: 'icons/icon128.png',
  },

  action: {
    default_title: 'ShowXhrUrl',
    default_icon: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
  },

  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },

  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },

  content_scripts: [
    {
      // MAIN world: patches fetch and XMLHttpRequest inside the page's own realm, which is
      // the only way to tell the two apart. Declared rather than injected, so a strict
      // Content Security Policy cannot block it.
      matches: ['<all_urls>'],
      js: ['src/content/page-hooks.ts'],
      world: 'MAIN',
      run_at: 'document_start',
      all_frames: true,
    },
    {
      // ISOLATED world: the only context with access to chrome.runtime, so it relays what
      // the hook observes to the service worker.
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      world: 'ISOLATED',
      run_at: 'document_start',
      all_frames: true,
    },
  ],
} as const;

export default manifest;
