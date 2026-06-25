import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {EndpointThunk} from '@/src/core/interface/utils/interface-types.js';
import {createCommerceSearchEndpointThunk} from '@/src/core/internal/api/search/commerce-search-thunk.js';
import {createFacadeCache} from '@/src/core/interface/utils/facade-cache.js';

export function createCommerceSearchFacadeResolver(engine: FullEngine) {
  return createFacadeCache<EndpointThunk>(
    engine,
    createCommerceSearchEndpointThunk
  );
}
