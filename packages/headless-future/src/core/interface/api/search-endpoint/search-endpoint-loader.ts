import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

export const loadSearchEndpoint = (engine: FullEngine) => {
  engine.adoptSlice(searchEndpointSlice);
};
