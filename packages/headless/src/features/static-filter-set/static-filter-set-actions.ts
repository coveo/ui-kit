import {ArrayValue, RecordValue, StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {
  StaticFilterValue,
  StaticFilterValueState,
} from './static-filter-set-state';

const staticFilterValueSchema = new RecordValue({
  options: {required: true},
  values: {
    caption: requiredEmptyAllowedString,
    expression: requiredEmptyAllowedString,
    state: new StringValue<StaticFilterValueState>({
      constrainTo: ['idle', 'selected'],
    }),
  },
});

interface RegisterStaticFilterActionCreatorPayload {
  /**
   * A unique identifier for the static filter.
   */
  id: string;

  /**
   * The values of the static filter.
   */
  values: StaticFilterValue[];
}

export const registerStaticFilter = createAction(
  'staticFilter/register',
  (payload: RegisterStaticFilterActionCreatorPayload) => {
    const schema = {
      id: requiredNonEmptyString,
      values: new ArrayValue({
        required: true,
        each: staticFilterValueSchema,
      }),
    };

    return validatePayload(payload, schema);
  }
);

interface ToggleSelectStaticFilterValueActionCreatorPayload {
  /**
   * The unique identifier for the static filter.
   */
  id: string;

  /**
   * The target static filter value.
   */
  value: StaticFilterValue;
}

export const toggleSelectStaticFilterValue = createAction(
  'staticFilter/toggleSelect',
  (payload: ToggleSelectStaticFilterValueActionCreatorPayload) => {
    const schema = {
      id: requiredNonEmptyString,
      value: staticFilterValueSchema,
    };

    return validatePayload(payload, schema);
  }
);
