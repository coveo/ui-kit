import {createSelector} from '@reduxjs/toolkit';
import {FacetSearchSection} from '../../../../state/state-sections.js';
import {SpecificFacetSearchState} from './specific-facet-search-set-state.js';

export const specificFacetSearchStateSelector = createSelector(
  (state: FacetSearchSection, facetId: string) => ({
    facetSearchSelector: state.facetSearchSet[facetId],
  }),
  ({facetSearchSelector}): SpecificFacetSearchState | undefined => {
    return facetSearchSelector;
  }
);
