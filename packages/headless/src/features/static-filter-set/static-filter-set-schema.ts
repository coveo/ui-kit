import {ArrayValue, RecordValue, StringValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';
import type {StaticFilterValueState} from './static-filter-set-state.js';

export const staticFilterIdSchema = requiredNonEmptyString;

export const staticFilterValueSchema = new RecordValue({
  options: {required: true},
  values: {
    caption: requiredEmptyAllowedString,
    expression: requiredEmptyAllowedString,
    state: new StringValue<StaticFilterValueState>({
      constrainTo: ['idle', 'selected', 'excluded'],
    }),
  },
});

export const staticFilterValuesSchema = new ArrayValue({
  required: true,
  each: staticFilterValueSchema,
});
