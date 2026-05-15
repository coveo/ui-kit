import {SearchEndpointFacade} from '@/src/api/interface/search-endpoint/search-endpoint-facade.js';
import {Engine} from '@/src/core/index.js';
import {getFullEngine} from '@/src/core/interface/engine/engine.js';

export const executeSearch = (engine: Engine) => {
  const fullEngine = getFullEngine(engine);
  const facade = SearchEndpointFacade.getInstance(fullEngine);
  facade.callEndpoint();
};
