const { FlatCompat } = require('@eslint/eslintrc')
const globals = require('globals')

const compat = new FlatCompat({
  baseDirectory: __dirname
})

module.exports = [
  // 1. Inherit the old 'standard' config patterns safely
  ...compat.extends('eslint-config-standard'),

  // 2. Your project's environment and rules settings
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.node
      }
    },
    rules: {
      // Add the custom rules we fixed earlier
      camelcase: 'error',
      'padded-blocks': ['error', 'never'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
]
