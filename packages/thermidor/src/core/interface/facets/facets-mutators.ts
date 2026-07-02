import {getOrCreateFacetsActions} from '@/src/core/internal/facets/facets-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search/search-types.js';

export const updateFromResponse = (
  facets: CoveoFacetResponse[] | undefined,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreateFacetsActions(iface);
  return actions.updateFromResponse(facets);
};
