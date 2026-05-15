import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import * as searchBoxMiddlewares from '@/src/core/internal/search-box/search-box-middlewares.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {SearchEndpointFacade} from '@/src/api/interface/search-endpoint/search-endpoint-facade.js';

const searchBoxLoadedEngines = new WeakSet<FullEngine>();

export const loadSearchBox = (engine: FullEngine) => {
  if (searchBoxLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(searchBoxSlice);
  const searchFacade = SearchEndpointFacade.getInstance(engine);
  searchFacade.onRequest(searchBoxMiddlewares.onSearchEndpointRequest(engine));

  searchBoxLoadedEngines.add(engine);
};
