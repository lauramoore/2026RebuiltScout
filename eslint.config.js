import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([

  globalIgnores([
    '**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'public/**',
    '**/.eslintrc.js', '**/node_modules/**'
  ]),

  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,mjs,jsx,vue}'],
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
  skipFormatting,
])
