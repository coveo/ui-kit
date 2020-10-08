import {createAction} from '@reduxjs/toolkit';
import {SortCriterion} from './criteria';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

const criterionDefinition = {
  expression: new StringValue({required: true, emptyAllowed: false}),
};

/**
 * Initializes the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
 * @param payload (SortCriterion) The initial sort criterion.
 */
export const registerSortCriterion = createAction(
  'sortCriteria/register',
  (payload: SortCriterion) =>
    validatePayloadSchema(payload, criterionDefinition)
);

/**
 * Updates the sortCriteria query parameter. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria).
 * @param payload (SortCriterion) The sort criterion to set.
 */
export const updateSortCriterion = createAction(
  'sortCriteria/update',
  (payload: SortCriterion) =>
    validatePayloadSchema(payload, criterionDefinition)
);
