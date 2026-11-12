import {RecordValue, Schema} from '@coveo/bueno';
import {nonRequiredEmptyAllowedString} from '../../../utils/validate-payload.js';
import type {BuildConfig} from '../types/build.js';

const searchDefinition = {
  searchParams: new RecordValue({
    options: {required: false},
    values: {q: nonRequiredEmptyAllowedString},
  }),
  context: new RecordValue({
    options: {required: false},
  }),
};

export const searchDefinitionSchema = new Schema(searchDefinition);

/**
 * Validates the page facts passed to `fetchStaticState()`, naming the engine definition they belong to.
 */
export function validateBuildConfig(buildConfig: BuildConfig): void {
  searchDefinitionSchema.validate(
    buildConfig,
    'Check the options passed to fetchStaticState() of the search engine definition.'
  );
}
