import {CommerceFacetSlice} from '../features/commerce/facets/facet-set/facet-set-state';
import {buildMockCommerceFacetRequest} from './mock-commerce-facet-request';

export function buildMockCommerceFacetSlice(
  config: Partial<CommerceFacetSlice> = {}
): CommerceFacetSlice {
  return {
    request: buildMockCommerceFacetRequest(),
    ...config,
  };
}
