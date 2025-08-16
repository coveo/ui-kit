import {
  cemPlugin,
  hideBaseInitializableComponentFieldsPlugin,
  hideBindStateToControllerFieldsPlugin,
  mapPropertyPlugin,
  removeUndefinedTypePlugin,
} from './scripts/cem-plugin.mjs';

export default {
  /** Globs to analyze */
  globs: ['src/**/*.tsx', 'src/**/*.ts'],
  /** Globs to exclude */
  exclude: [
    '**/*.stories.tsx',
    '**/*.stories.ts',
    '**/*.stories.js',
    '**/*.spec.ts',
  ],
  stencil: true,
  litelement: true,
  plugins: [
    cemPlugin(),
    mapPropertyPlugin(),
    removeUndefinedTypePlugin(),
    hideBaseInitializableComponentFieldsPlugin(),
    hideBindStateToControllerFieldsPlugin(),
  ],
};
