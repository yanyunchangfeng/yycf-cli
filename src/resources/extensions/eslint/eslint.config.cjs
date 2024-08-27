const globals = require('globals');
const pluginJs = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginReact = require('eslint-plugin-react');

module.exports = [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { globals: { ...globals.browser } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    ignores: [
      '*',
      '!*/',
      'config/',
      'cypress/',
      'jscpd-report/',
      'madge-report/',
      'eslint-report/',
      'plato-report/',
      'node_modules/'
    ]
  }
];
