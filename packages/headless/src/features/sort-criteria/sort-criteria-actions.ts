import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';
import {SortBy, type SortCriterion} from './criteria.js';

const criterionDefinition = z.object({
  by: z.enum([
    SortBy.Relevancy,
    SortBy.QRE,
    SortBy.Date,
    SortBy.Field,
    SortBy.NoSort,
  ]),
});

export const registerSortCriterion = createAction(
  'sortCriteria/register',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

export const updateSortCriterion = createAction(
  'sortCriteria/update',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

const validate = (payload: SortCriterion | SortCriterion[]) => {
  if (Array.isArray(payload)) {
    payload.forEach((p) => validatePayload(p, criterionDefinition));
    return {payload};
  }
  return validatePayload(payload, criterionDefinition);
};
