import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {createSearchEndpointRequestSelector} from './search-request-selector.js';
import {createSearchEndpointResponseHandler} from './search-response-handler.js';
import {readEndpointClientConfiguration} from '@/src/internal/features/configuration/index.js';
import {createSearchEndpointClient} from '@/src/internal/api/search/index.js';
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
