import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {hideBaseInitializableComponentFieldsPlugin} from './scripts/cem-plugins/hide-base-initializable-component-fields.mjs';
import {hideBindStateToControllerFieldsPlugin} from './scripts/cem-plugins/hide-bind-state-to-controller-fields.mjs';
import {keepCustomElementsPlugin} from './scripts/cem-plugins/keep-custom-elements.mjs';
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
   * `customElements` is already set in `package.json`. Without this, the analyzer also writes it into
   * the `package.json` of the working directory, which is the monorepo root's when the specs run there.
   */
  packagejson: false,
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
    keepCustomElementsPlugin(),
    mapPropertyPlugin(),
    removeUndefinedTypePlugin(),
    hideBaseInitializableComponentFieldsPlugin(),
    hideBindStateToControllerFieldsPlugin(),
  ],
};
