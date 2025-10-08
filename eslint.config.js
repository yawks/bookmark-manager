import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import refreshPlugin from 'eslint-plugin-react-refresh'

export default tseslint.config(
  {
    // Global ignores
    ignores: ['dist', 'node_modules/'],
  },
  {
    // Config for JS/CJS files (configuration files)
    files: ['**/*.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'error',
    },
  },
  {
    // Config for TS/TSX files (source code)
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
      'react-refresh': refreshPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.stylistic.rules,
      ...hooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)