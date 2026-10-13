import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {hideBaseInitializableComponentFieldsPlugin} from './scripts/cem-plugins/hide-base-initializable-component-fields.mjs';
import {hideBindStateToControllerFieldsPlugin} from './scripts/cem-plugins/hide-bind-state-to-controller-fields.mjs';
import {keepCustomElementExportsPlugin} from './scripts/cem-plugins/keep-custom-element-exports.mjs';
import {mapPropertyPlugin} from './scripts/cem-plugins/map-property.mjs';
import {removeUndefinedTypePlugin} from './scripts/cem-plugins/remove-undefined-type.mjs';

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
  litelement: true,
  /**
   * The analyzer visits files in the order the file system returns them, which is not stable.
   * Sorting them makes the manifest byte-for-byte reproducible.
   */
  overrideModuleCreation: ({ts, globs}) =>
    [...globs]
      .sort()
      .map((file) =>
        ts.createSourceFile(file, readFileSync(resolve(file), 'utf8'), ts.ScriptTarget.ES2015, true)
      ),
  plugins: [
    keepCustomElementExportsPlugin(),
    mapPropertyPlugin(),
    removeUndefinedTypePlugin(),
    hideBaseInitializableComponentFieldsPlugin(),
    hideBindStateToControllerFieldsPlugin(),
  ],
};
