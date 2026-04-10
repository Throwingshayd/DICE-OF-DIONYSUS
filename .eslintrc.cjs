/* eslint-env node */
'use strict';

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'reference/', '*.cjs'],
  overrides: [
    {
      files: ['game/js/**/*.js'],
      env: { browser: true },
      parserOptions: { ecmaVersion: 2022 },
      rules: {
        // Script-tag loaded: classes/constants are globals, not imports
        'no-undef': 'off',
        'no-case-declarations': 'warn',
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      },
    },
    {
      files: ['game/js/classes/Boon.js', 'game/js/classes/boonTimingHandlers.js'],
      rules: {
        // Large per-boon switches: const-in-case is scoped per arm at runtime.
        'no-case-declarations': 'off',
      },
    },
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
};
