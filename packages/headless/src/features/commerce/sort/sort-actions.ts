import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload.js';
import {SortBy, type SortCriterion} from './sort.js';

export type ApplySortPayload = SortCriterion;

export const applySort = createAction(
  'commerce/sort/apply',
  (payload: ApplySortPayload) =>
    validatePayload(
      payload,
      z.object({
        by: z.enum(Object.values(SortBy) as [string, ...string[]]),
      }) as z.ZodMiniType<ApplySortPayload>
    )
);
