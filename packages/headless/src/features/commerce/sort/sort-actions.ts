import {validatePayload} from '../../../utils/validate-payload';
import {createAction} from '@reduxjs/toolkit';
import {SortBy, SortCriterion} from './sort';
import {EnumValue, SchemaDefinition} from '@coveo/bueno';

export const applySort = createAction(
  'commerce/productListing/sort/apply',
  (payload: SortCriterion) =>
    validatePayload(payload, {
      by: new EnumValue<SortBy>({
        enum: SortBy,
        required: true,
      }),
    } as SchemaDefinition<SortCriterion>)
);
