import {createAction} from '@reduxjs/toolkit';
import {SortBy, SortCriterion} from './criteria';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {EnumValue, isArray, SchemaDefinition} from '@coveo/bueno';

const criterionDefinition = {
  by: new EnumValue<SortBy>({enum: SortBy, required: true}),
} as SchemaDefinition<SortCriterion>;
/**
 * Initializes the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
 * @param payload (SortCriterion) The initial sort criterion.
 */
export const registerSortCriterion = createAction(
  'sortCriteria/register',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

/**
 * Updates the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
 * @param payload (SortCriterion) The sort criterion to set.
 */
export const updateSortCriterion = createAction(
  'sortCriteria/update',
  (payload: SortCriterion | SortCriterion[]) => validate(payload)
);

const validate = (payload: SortCriterion | SortCriterion[]) => {
  if (isArray(payload)) {
    payload.forEach((p) => validatePayloadSchema(p, criterionDefinition));
    return {payload};
  }
  return validatePayloadSchema(payload, criterionDefinition);
};
