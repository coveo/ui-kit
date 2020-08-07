import {RangeFacetSortCriterion} from './interfaces/request';
import {createAction} from '@reduxjs/toolkit';

/**
 * Updates the sort criterion of a range facet.
 */
export const updateRangeFacetSortCriterion = createAction<{
  facetId: string;
  criterion: RangeFacetSortCriterion;
}>('rangeFacet/updateSortCriterion');
