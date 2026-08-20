import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * ESLint 10 flat config. The legacy `.eslintrc` format no longer works.
 *
 * Type-aware linting is on for the whole of `src`: the rules that actually catch bugs in
 * this codebase (floating promises, unsafe member access on `any`, misused promises in
 * event listeners) all need type information.
 */
export default defineConfig(
  {
    // `.claude/` holds the local assistant context layer; it is gitignored and vendored.
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '.claude/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Tooling scripts outside the app program that must still be linted.
          allowDefaultProject: ['eslint.config.mjs', 'work/_generate-units.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // `unknown` plus a narrowing check is the escape hatch, never `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      // A dropped promise in a listener fails silently; that is how requests go missing.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // A discarded parameter must say so; a discarded value must not linger.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      /* Rules relaxed on purpose. Each one is a style rule that fights an idiom this
         project uses deliberately; none of them describes a defect here. */

      // Zustand setters and React event handlers both return void from a shorthand arrow.
      // `() => set({ requests })` is the documented Zustand idiom, not a mistake.
      '@typescript-eslint/no-confusing-void-expression': 'off',

      // HTTP header names are looked up in bracket notation throughout, because they are
      // data keys rather than object properties and several contain hyphens.
      '@typescript-eslint/dot-notation': ['error', { allowIndexSignaturePropertyAccess: true }],

      // Interpolating a status code or a byte count into a string needs no ceremony.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: false, allowNullish: false },
      ],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.chrome },
    },
  },

  {
    files: ['src/sidepanel/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat['recommended-latest']],
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  {
    // Monkey-patching `fetch` and `XMLHttpRequest.prototype.open` means capturing the
    // originals unbound on purpose, then re-applying them with `.call(this, ...)`.
    files: ['src/content/page-hooks.ts'],
    rules: { '@typescript-eslint/unbound-method': 'off' },
  },

  {
    // Build-time config that runs under Node, not in a browser context.
    files: ['vite.config.ts', 'src/manifest.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  {
    // Plain-JavaScript tooling scripts. Type-aware rules cannot say anything useful about a
    // file with no types: every value reads as `any` and the whole strict set fires at once.
    // They are still linted for real defects by the base recommended set.
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-console': 'off',
    },
  },
);
