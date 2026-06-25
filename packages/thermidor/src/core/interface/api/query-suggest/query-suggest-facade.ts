import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {EndpointThunk} from '@/src/core/interface/utils/interface-types.js';
import {createQuerySuggestThunk} from '@/src/core/internal/api/query-suggest/query-suggest-thunk.js';
import {createFacadeCache} from '@/src/core/interface/utils/facade-cache.js';

export function createQuerySuggestFacadeResolver(engine: FullEngine) {
  return createFacadeCache<EndpointThunk>(engine, createQuerySuggestThunk);
}
