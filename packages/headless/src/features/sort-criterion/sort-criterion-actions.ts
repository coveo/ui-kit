import {createAction} from '@reduxjs/toolkit';
import {SortCriterion} from './criteria';

/**
 * Initializes the sortCritera. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria}
 * @param string The initial sort criterion.
 */
export const registerSortCriterion = createAction<SortCriterion>(
  'sortCriteria/register'
);

/**
 * Updates the sortCritera to the passed criterion.
 * @param string The updated sort criterion.
 */
export const updateSortCriterion = createAction<SortCriterion>(
  'sortCriteria/update'
);
