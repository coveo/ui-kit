import {createAction} from '@reduxjs/toolkit';
import {SortCriterion} from './criteria';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

const criterionDefinition = {
  expression: new StringValue({required: true, emptyAllowed: false}),
};

/**
 * Initializes the sortCritera. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria}
 * @param string The initial sort criterion.
 */
export const registerSortCriterion = createAction(
  'sortCriteria/register',
  (payload: SortCriterion) =>
    validatePayloadSchema(payload, criterionDefinition)
);

/**
 * Updates the sortCritera to the passed criterion.
 * @param string The updated sort criterion.
 */
export const updateSortCriterion = createAction(
  'sortCriteria/update',
  (payload: SortCriterion) =>
    validatePayloadSchema(payload, criterionDefinition)
);
