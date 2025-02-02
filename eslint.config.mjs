import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**', 
      'artifacts/**', 
      'cache/**', 
      'coverage/**', 
      'lib/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      'semi': ['error', 'always'],
      'indent': ['error', 4],
      'no-unused-vars': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': 'warn',
    },
  },
];