// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "vite-plugin-web-extension";
import path from "path";

// Manifest V3 with Side Panel
const manifest = {
  name: "ShowXhrUrl",
  version: "2.0.0",
  manifest_version: 3,
  description: "Monitor and display all XHR/fetch request URLs with complete details",
  permissions: [
    "webRequest",
    "tabs",
    "storage",
    "clipboardWrite",
    "cookies",
    "sidePanel",
  ],
  host_permissions: ["<all_urls>"],
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
  action: {
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },
  side_panel: {
    default_path: "src/sidepanel/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
    },
  ],
};

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: () => manifest,
      browser: "chrome",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/sidepanel/components"),
      "@hooks": path.resolve(__dirname, "./src/sidepanel/hooks"),
      "@lib": path.resolve(__dirname, "./src/sidepanel/lib"),
      "@stores": path.resolve(__dirname, "./src/sidepanel/stores"),
    },
  },
});
