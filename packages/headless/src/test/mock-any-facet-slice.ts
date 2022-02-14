import {AnyFacetSlice} from '../features/facets/any-facet-set/any-facet-set-state';

export function buildAnyFacetSlice(
  config: Partial<AnyFacetSlice> = {}
): AnyFacetSlice {
  return {
    enabled: true,
    ...config,
  };
}
