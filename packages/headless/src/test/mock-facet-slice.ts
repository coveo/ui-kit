import {FacetSlice} from '../features/facets/facet-set/facet-set-state';
import {buildMockFacetRequest} from './mock-facet-request';

export function buildMockFacetSlice(
  config: Partial<FacetSlice> = {}
): FacetSlice {
  return {
    request: buildMockFacetRequest(),
    hasBreadcrumbs: true,
    ...config,
  };
}
