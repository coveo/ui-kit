import {Engine, getFullEngine} from '@/src/core/index.js';
import {SearchEndpointFacade} from '@/src/core/interface/api/search-endpoint/search-endpoint-facade.js';

export const executeSearch = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);
  const facade = SearchEndpointFacade.getInstance(fullEngine);
  facade.callEndpoint();
};
