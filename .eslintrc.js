const path = require('path');
const fs = require('fs');
const globals = require('eslint-restricted-globals');
const { configs: ts } = require('@typescript-eslint/eslint-plugin');
const project = require('./project.config');

const dir = (file) => path.join(project.get('paths.root'), file);
const prettier = require(dir('.prettierrc'));
const babel = JSON.parse(fs.readFileSync(dir('.babelrc')));
const aliases =
  babel &&
  babel.plugins &&
  babel.plugins
    .filter((plugin) => Array.isArray(plugin))
    .filter((plugin) => plugin[0] === 'babel-plugin-module-resolver')
    .map((plugin) => plugin[1] && plugin[1].alias)[0];

module.exports = {
  root: true,
  extends: ['standard', 'plugin:import/errors', 'prettier'],
  env: {
    node: true,
    jest: true
  },
  parserOptions: {
    impliedStrict: true,
    sourceType: 'module'
  },
  plugins: ['prettier', 'jest', 'import'],
  globals: {},
  rules: {
    /* DISABLED */
    'standard/no-callback-literal': 0,
    /* WARNINGS */
    'no-warning-comments': [
      1,
      { terms: ['xxx', 'fixme', 'todo', 'refactor'], location: 'start' }
    ],
    'no-unused-vars': 1,
    'no-console': 1,
    /* ERRORS */
    // Add custom globals
    'no-restricted-globals': [2, 'fetch'].concat(globals),
    // Prettier
    'prettier/prettier': [2, prettier]
  },
  settings: {
    'import/resolver': {
      alias: {
        map: Object.entries(aliases || {}),
        extensions: ['json']
          .concat(project.get('ext.js').split(','))
          .concat(
            project.get('typescript') ? project.get('ext.ts').split(',') : []
          )
          .filter(Boolean)
          .map((x) => '.' + x)
      }
    }
  },
  overrides: [
    /* JAVASCRIPT */
    {
      files: [`*.{${project.get('ext.js')}}`],
      parser: 'babel-eslint',
      plugins: ['babel'],
      rules: {
        'babel/no-invalid-this': 1,
        'babel/semi': 1
      }
    },
    /* TYPESCRIPT */
    {
      files: [`*.{${project.get('ext.ts')}}`],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      // Overrides don't allow for extends
      rules: Object.assign(ts.recommended.rules, {
        /* DISABLED */
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-object-literal-type-assertion': 0,
        /* WARNINGS */
        '@typescript-eslint/camelcase': 1,
        '@typescript-eslint/explicit-function-return-type': [
          1,
          { allowExpressions: true, allowTypedFunctionExpressions: true }
        ],
        '@typescript-eslint/no-unused-vars': [
          1,
          {
            args: 'after-used',
            argsIgnorePattern: '_.*',
            ignoreRestSiblings: true
          }
        ],
        /* ERRORS */
        '@typescript-eslint/interface-name-prefix': [2, 'always'],
        '@typescript-eslint/no-use-before-define': [2, { functions: false }],
        '@typescript-eslint/array-type': [2, 'array-simple']
      })
    }
  ]
};
