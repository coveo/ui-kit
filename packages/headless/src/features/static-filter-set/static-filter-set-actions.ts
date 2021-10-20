import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {
  staticFilterIdSchema,
  staticFilterValueSchema,
  staticFilterValuesSchema,
} from './static-filter-set-schema';
import {StaticFilterValue} from './static-filter-set-state';

export interface RegisterStaticFilterActionCreatorPayload {
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
      id: staticFilterIdSchema,
      values: staticFilterValuesSchema,
    };

    return validatePayload(payload, schema);
  }
);

export interface ToggleSelectStaticFilterValueActionCreatorPayload {
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
      id: staticFilterIdSchema,
      value: staticFilterValueSchema,
    };

    return validatePayload(payload, schema);
  }
);

export const deselectAllStaticFilterValues = createAction(
  'staticFilter/deselectAllFilterValues',
  (payload: string) => {
    return validatePayload(payload, staticFilterIdSchema);
  }
);
