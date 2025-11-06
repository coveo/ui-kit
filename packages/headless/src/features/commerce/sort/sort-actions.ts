import {createAction} from '@reduxjs/toolkit';
import {EnumValue, type SchemaDefinition} from '../../../utils/bueno-zod.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {SortBy, type SortCriterion} from './sort.js';

export type ApplySortPayload = SortCriterion;

export const applySort = createAction(
  'commerce/sort/apply',
  (payload: ApplySortPayload) =>
    validatePayload(payload, {
      by: new EnumValue<SortBy>({
        enum: SortBy,
        required: true,
      }),
    } as SchemaDefinition<ApplySortPayload>)
);
