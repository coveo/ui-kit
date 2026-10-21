import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  cemPlugin,
  hideBaseInitializableComponentFieldsPlugin,
  hideBindStateToControllerFieldsPlugin,
  mapPropertyPlugin,
  removeUndefinedTypePlugin,
} from './scripts/cem-plugin.mjs';

/**
 * Keep `globs` and `exclude` in sync with the `build:cem` inputs in `turbo.json`,
 * so Turbo can tell when the manifest needs to be rebuilt.
 */
export default {
  globs: ['src/**/*.ts'],
  exclude: [
    '**/*.stories.ts',
    '**/*.spec.ts',
    '**/*.d.ts',
    '**/e2e/**',
    'src/generated/**',
    'src/components/*/index.ts',
    'src/components/*/lazy-index.ts',
    'src/utils/custom-element-tags.ts',
  ],
  stencil: true,
  litelement: true,
  /**
   * The analyzer visits files in the order the file system returns them, which is not stable.
   * Sorting them makes the manifest byte-for-byte reproducible.
   */
  overrideModuleCreation: ({ts, globs}) =>
    globs
      .toSorted()
      .map((file) =>
        ts.createSourceFile(
          file,
          readFileSync(resolve(import.meta.dirname, file), 'utf8'),
          ts.ScriptTarget.ES2015,
          true
        )
      ),
  plugins: [
    cemPlugin(),
    mapPropertyPlugin(),
    removeUndefinedTypePlugin(),
    hideBaseInitializableComponentFieldsPlugin(),
    hideBindStateToControllerFieldsPlugin(),
  ],
};
