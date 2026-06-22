import {getOrCreateFacetsActions} from '@/src/core/internal/facets/facets-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const defaultActions = getOrCreateFacetsActions('default');

export const updateFromResponse = (
  facets: CoveoFacetResponse[] | undefined
): StateMutation => {
  return defaultActions.updateFromResponse(facets);
};
