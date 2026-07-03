import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {createSearchEndpointRequestSelector} from './search-request-selector.js';
import {createSearchEndpointResponseHandler} from './search-response-handler.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
import {getOrCreateSearchEndpointSlice} from './search-thunk-slice.js';

export function createSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope
) {
  const {stateId} = getHandleInternals(scope.scopeInterface);
  const buildRequest = createSearchEndpointRequestSelector(scope);
  const handleResponse = createSearchEndpointResponseHandler(
    scope.baseInterface
  );

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/searchEndpoint/execute`,
    async ({engine}) => {
      const request = engine.read(buildRequest);
      const config = readEndpointClientConfiguration(engine);
      const response = await createSearchEndpointClient().call(request, config);

      if (!response.success) {
        throw new Error(response.error);
      }
      if (response.data) {
        handleResponse(engine, response.data);
      }
    }
  );

  engine.adoptSlice(
    getOrCreateSearchEndpointSlice(scope.scopeInterface, thunk)
  );

  return thunk;
}
