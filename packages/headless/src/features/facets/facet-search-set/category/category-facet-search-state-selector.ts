import {createSelector} from '@reduxjs/toolkit';
import type {CategoryFacetSearchSection} from '../../../../state/state-sections.js';
import type {CategoryFacetSearchState} from './category-facet-search-set-state.js';

export const categoryFacetSearchStateSelector = createSelector(
  (state: CategoryFacetSearchSection, facetId: string) => ({
    facetSearchSelector: state.categoryFacetSearchSet[facetId],
  }),
  ({facetSearchSelector}): CategoryFacetSearchState | undefined => {
    return facetSearchSelector;
  }
);
