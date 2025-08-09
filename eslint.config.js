import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  // Global ignores
  {
    ignores: [
      'dist', 
      'node_modules', 
      'build', 
      '*.log',
      'backend/**/*_old.js', // Ignore old/legacy files
      'backend/**/*_new.js', // Ignore new/experimental files
    ]
  },
  
  // Frontend TypeScript configuration
  {
    files: ['src/**/*.{ts,tsx,js}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
    },
  },

  // Backend JavaScript configuration
  {
    files: ['backend/**/*.js'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Allow console.log in backend
      'no-console': 'off',
      // Allow unused vars with underscore prefix
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      // Allow process.env usage
      'no-process-env': 'off',
    },
  },

  // Backend TypeScript configuration
  {
    files: ['backend/**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.jest,
      },
    },
    rules: {
      // TS handles undefineds; disable base rule to avoid false positives
      'no-undef': 'off',
      // Allow console in backend
      'no-console': 'off',
      // Align unused vars rule with JS config
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
    },
  },

  // Tests in backend: allow console
  {
    files: ['backend/**/__tests__/**/*.{ts,js}', 'backend/tests/**/*.{ts,js}', 'backend/test/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // Configuration files
  {
    files: ['*.config.{js,ts,mjs}', '.eslintrc.{js,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
