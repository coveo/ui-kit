import {ArrayValue, RecordValue, StringValue} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {StaticFilterValueState} from './static-filter-set-state';

export const staticFilterIdSchema = requiredNonEmptyString;

export const staticFilterValueSchema = new RecordValue({
  options: {required: true},
  values: {
    caption: requiredEmptyAllowedString,
    expression: requiredEmptyAllowedString,
    state: new StringValue<StaticFilterValueState>({
      constrainTo: ['idle', 'selected'],
    }),
  },
});

export const staticFilterValuesSchema = new ArrayValue({
  required: true,
  each: staticFilterValueSchema,
});
