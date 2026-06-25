import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {EndpointThunk} from '@/src/core/interface/utils/interface-types.js';
import {createCommerceSuggestionsThunk} from '@/src/core/internal/api/commerce-query-suggest/commerce-query-suggest-thunk.js';
import {createFacadeCache} from '@/src/core/interface/utils/facade-cache.js';

export function createCommerceSuggestionsFacadeResolver(engine: FullEngine) {
  return createFacadeCache<EndpointThunk>(
    engine,
    createCommerceSuggestionsThunk
  );
}
