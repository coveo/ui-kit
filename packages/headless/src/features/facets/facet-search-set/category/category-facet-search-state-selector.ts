import {createSelector} from '@reduxjs/toolkit';
import {CategoryFacetSearchSection} from '../../../../state/state-sections.js';
import {CategoryFacetSearchState} from './category-facet-search-set-state.js';

export const categoryFacetSearchStateSelector = createSelector(
  (state: CategoryFacetSearchSection, facetId: string) => ({
    facetSearchSelector: state.categoryFacetSearchSet[facetId],
  }),
  ({facetSearchSelector}): CategoryFacetSearchState | undefined => {
    return facetSearchSelector;
  }
);
