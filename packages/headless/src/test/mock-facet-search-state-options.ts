import {
  FacetSearchStateOptions,
  defaultFacetSearchOptions,
} from '../features/facets/facet-search-set/facet-search-reducer-helpers';

export function buildMockFacetSearchStateOptions(
  config: Partial<FacetSearchStateOptions> = {}
): FacetSearchStateOptions {
  return {
    ...defaultFacetSearchOptions,
    initialNumberOfValues: defaultFacetSearchOptions.numberOfValues,
    ...config,
  };
}
