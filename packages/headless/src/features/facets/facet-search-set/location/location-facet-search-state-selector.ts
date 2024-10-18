import {createSelector} from '@reduxjs/toolkit';
import {FacetSearchSection} from '../../../../state/state-sections.js';
import {LocationFacetSearchState} from './location-facet-search-set-state.js';

export const locationFacetSearchStateSelector = createSelector(
  (state: FacetSearchSection, facetId: string) => ({
    facetSearchSelector: state.facetSearchSet[facetId],
  }),
  ({facetSearchSelector}): LocationFacetSearchState | undefined => {
    return facetSearchSelector;
  }
);
