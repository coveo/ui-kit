import {AutomaticFacetSlice} from '../features/facets/automatic-facet-set/automatic-facet-set-state';
import {buildMockAutomaticFacetResponse} from './mock-automatic-facet-response';

export function buildMockAutomaticFacetSlice(
  config: Partial<AutomaticFacetSlice> = {}
): AutomaticFacetSlice {
  return {
    response: buildMockAutomaticFacetResponse(),
    ...config,
  };
}
