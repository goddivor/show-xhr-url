// vite.config.ts
import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import path from 'path';
import type { PluginOption } from 'vite';

// Créer un objet manifest séparé
const manifest = {
  name: 'ShowXhrUrl',
  version: '1.0.0',
  manifest_version: 3,
  description: 'Affiche tous les URLs des requêtes fetch/XHR avec détails complets',
  permissions: [
    'webRequest',
    'tabs',
    'storage',
    'clipboardWrite',
    'cookies',
    'http://*/*',
    'https://*/*'
  ],
  host_permissions: ['<all_urls>'],
  action: {
    default_popup: 'src/popup/index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts']
    }
  ],
  web_accessible_resources: [
    {
      resources: ['src/inject/index.ts'],
      matches: ['<all_urls>']
    }
  ]
};

export default defineConfig({
  plugins: [
    // @ts-ignore - Ignorer les erreurs de type pour le manifest
    webExtension({
      manifest: () => manifest,
      browser: 'chrome'
    }) as PluginOption
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});