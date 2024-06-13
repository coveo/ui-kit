import {cemPlugin} from './scripts/cem-plugin.mjs';

export default {
  /** Globs to analyze */
  globs: ['src/**/*.tsx'],
  /** Globs to exclude */
  exclude: ['**/*.stories.tsx', '**/*.stories.ts', '**/*.stories.js'],
  stencil: true,
  plugins: [cemPlugin()],
};
