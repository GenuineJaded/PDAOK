// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['load_time_anchors.js', 'populate_anchors.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
      },
    },
  },
]);
