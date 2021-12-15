import {createAction} from '@reduxjs/toolkit';
import {SortBy, SortCriterion} from './criteria';
import {validatePayload} from '../../utils/validate-payload';
import {EnumValue, isArray, SchemaDefinition} from '@coveo/bueno';

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
