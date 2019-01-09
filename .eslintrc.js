const globals = require('eslint-restricted-globals');

module.exports = {
  root: true,
  parser: 'babel-eslint',
  extends: ['standard', 'plugin:import/errors', 'prettier'],
  env: {
    node: true,
    jest: true
  },
  parserOptions: {
    impliedStrict: true
  },
  plugins: ['prettier', 'jest', 'import', 'babel'],
  globals: {},
  rules: {
    'no-warning-comments': [
      1,
      { terms: ['xxx', 'fixme', 'todo', 'refactor'], location: 'start' }
    ],
    'no-unused-vars': 1, // Set as warning
    'no-console': 1,
    'no-restricted-globals': [2, 'fetch'].concat(globals),
    // eslint-plugin-babel
    'babel/no-invalid-this': 1,
    'babel/semi': 1,
    // Prettier
    'prettier/prettier': [2, require('./.prettierrc')]
  },
  settings: {
    // babel-plugin-module-resolver
    'import/resolver': {
      'babel-module': {}
    },
    // eslint-import-resolver-typescript
    'import/resolver': {
      typescript: {}
    }
  }
};
