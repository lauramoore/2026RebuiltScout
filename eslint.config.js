import { defineConfig, globalIgnores } from 'eslint/config'
import { fileURLToPath } from 'node:url'
import globals from 'globals'
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  globalIgnores([
    '**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'public/**',
    '**/.eslintrc.js', '**/node_modules/**',
    'functions/lib/**',
    'functions/generated/**',
  ]),

  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,mjs,jsx,vue,ts,tsx}'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    name: 'functions/ts-files',
    files: ['functions/src/**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.dev.json'],
        tsconfigRootDir: fileURLToPath(new URL('functions/', import.meta.url)),
        sourceType: 'module',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
      ...importPlugin.configs.errors.rules,
      ...importPlugin.configs.warnings.rules,
      ...importPlugin.configs.typescript.rules,
      'quotes': ['error', 'double'],
      'indent': ['error', 2],
      'object-curly-spacing': ['error', 'always'],
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  skipFormatting,
])
