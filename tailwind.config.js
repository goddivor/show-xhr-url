/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/sidepanel/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // DevTools-like color palette
        devtools: {
          // Light theme
          'bg-primary': '#ffffff',
          'bg-secondary': '#f3f3f3',
          'bg-tertiary': '#e8e8e8',
          'bg-hover': '#eaeaea',
          'text-primary': '#303030',
          'text-secondary': '#5f6368',
          'border': '#dadce0',
          'accent': '#1a73e8',
          // Dark theme variants
          'dark-bg-primary': '#202124',
          'dark-bg-secondary': '#292a2d',
          'dark-bg-tertiary': '#35363a',
          'dark-bg-hover': '#3c4043',
          'dark-text-primary': '#e8eaed',
          'dark-text-secondary': '#9aa0a6',
          'dark-border': '#3c4043',
          'dark-accent': '#8ab4f8',
        },
        // Status colors
        status: {
          success: '#34a853',
          warning: '#fbbc04',
          error: '#ea4335',
          info: '#4285f4',
        },
        // HTTP method colors
        method: {
          get: '#34a853',
          post: '#4285f4',
          put: '#fbbc04',
          patch: '#ff9800',
          delete: '#ea4335',
          options: '#9e9e9e',
          head: '#9c27b0',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['11px', '14px'],
        'sm': ['12px', '16px'],
        'base': ['13px', '18px'],
      },
      spacing: {
        'row': '28px',
      },
    },
  },
  plugins: [],
}
