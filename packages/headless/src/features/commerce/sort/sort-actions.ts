import {EnumValue, SchemaDefinition} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {SortBy, SortCriterion} from './sort';

export const applySort = createAction(
  'commerce/sort/apply',
  (payload: SortCriterion) =>
    validatePayload(payload, {
      by: new EnumValue<SortBy>({
        enum: SortBy,
        required: true,
      }),
    } as SchemaDefinition<SortCriterion>)
);
