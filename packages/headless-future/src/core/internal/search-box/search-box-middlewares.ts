import {
  CoveoSearchEndpointRequest,
  CoveoSearchEndpointRequestMiddleware,
} from '@/src/api/interface/search-endpoint/search-endpoint-types.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

export const onSearchEndpointRequest: (
  engine: FullEngine
) => CoveoSearchEndpointRequestMiddleware = (engine: FullEngine) => {
  return (request: CoveoSearchEndpointRequest) => {
    request.q = engine.read(searchBoxSelectors.getQuery);
    return request;
  };
};
