import {RangeFacetSortCriterion} from './interfaces/request';
import {createAction} from '@reduxjs/toolkit';

/**
 * Updates the sort criterion of a range facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateRangeFacetSortCriterion = createAction<{
  facetId: string;
  criterion: RangeFacetSortCriterion;
}>('rangeFacet/updateSortCriterion');
