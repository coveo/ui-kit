import type {CategoryFacetSearchSection} from '../../../../state/state-sections.js';
import type {CategoryFacetSearchState} from './category-facet-search-set-state.js';

export const categoryFacetSearchStateSelector = (
  state: CategoryFacetSearchSection,
  facetId: string
): CategoryFacetSearchState | undefined =>
  state.categoryFacetSearchSet[facetId];
