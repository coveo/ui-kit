import {resolve} from 'path';
import {fileURLToPath} from 'url';

// Resolve the path to the gts package.json
const gtsPkgJsonPath = fileURLToPath(
  new URL('gts/package.json', import.meta.url)
);
const gtsPath = resolve(gtsPkgJsonPath, '..');

export default {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  extends: [gtsPath],
  ignorePatterns: ['build/**', '**/build/**', '**/*.js'],
};
