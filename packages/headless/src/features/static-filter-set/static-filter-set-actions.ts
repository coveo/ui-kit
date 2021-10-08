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
        each: new RecordValue({
          values: {
            caption: requiredEmptyAllowedString,
            expression: requiredEmptyAllowedString,
            state: new StringValue<StaticFilterValueState>({
              constrainTo: ['idle', 'selected'],
            }),
          },
        }),
      }),
    };

    return validatePayload(payload, schema);
  }
);
