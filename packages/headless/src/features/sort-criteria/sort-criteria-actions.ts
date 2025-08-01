import {EnumValue, isArray, type SchemaDefinition} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';
import {SortBy, type SortCriterion} from './criteria.js';

const criterionDefinition = {
  by: new EnumValue<SortBy>({enum: SortBy, required: true}),
} as SchemaDefinition<SortCriterion>;

export const registerSortCriterion = createAction(
  'sortCriteria/register',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

export const updateSortCriterion = createAction(
  'sortCriteria/update',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

const validate = (payload: SortCriterion | SortCriterion[]) => {
  if (isArray(payload)) {
    payload.forEach((p) => validatePayload(p, criterionDefinition));
    return {payload};
  }
  return validatePayload(payload, criterionDefinition);
};
