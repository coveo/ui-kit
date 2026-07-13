import type {FacetSearchSection} from '../../../../state/state-sections.js';
import type {SpecificFacetSearchState} from './specific-facet-search-set-state.js';

export const specificFacetSearchStateSelector = (
  state: FacetSearchSection,
  facetId: string
): SpecificFacetSearchState | undefined => state.facetSearchSet[facetId];
