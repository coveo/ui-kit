import {createSelector} from '@reduxjs/toolkit';
import {FacetSearchSection} from '../../../../state/state-sections';
import {SpecificFacetSearchState} from './specific-facet-search-set-state';

export const specificFacetSearchStateSelector = createSelector(
  (state: FacetSearchSection, facetId: string) => ({
    facetSearchSelector: state.facetSearchSet[facetId],
  }),
  ({facetSearchSelector}): SpecificFacetSearchState | undefined => {
    return facetSearchSelector;
  }
);
