import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {SearchEndpointFacade} from '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js';
import * as searchBoxSelectors from './search-box-selectors.js';

const searchBoxLoadedEngines = new WeakSet<FullEngine>();

export const loadSearchBox = (engine: FullEngine) => {
  if (searchBoxLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(searchBoxSlice);
  const searchEndpointFacade = SearchEndpointFacade.getInstance(engine);
  searchEndpointFacade.onRequest(() => ({
    q: engine.read(searchBoxSelectors.getQuery),
  }));

  searchBoxLoadedEngines.add(engine);
};
