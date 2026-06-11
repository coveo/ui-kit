import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const searchEndpointLoadedEngines = new WeakSet<FullEngine>();

export const loadSearchEndpoint = (engine: FullEngine) => {
  if (searchEndpointLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(searchEndpointSlice);

  searchEndpointLoadedEngines.add(engine);
};
