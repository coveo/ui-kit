import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {createSearchEndpointRequestSelector} from './search-endpoint-request-selector.js';
import {createSearchEndpointResponseHandler} from './search-endpoint-response-handler.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {createSearchEndpointClient} from '@/src/api/interface/search-endpoint/search-endpoint-client.js';
import {getOrCreateSearchEndpointSlice} from './search-endpoint-thunk-slice.js';

export function createSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope
) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const buildRequest = createSearchEndpointRequestSelector(scope);
  const handleResponse = createSearchEndpointResponseHandler(scope.interfaceId);

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${sharableInterfaceId}/searchEndpoint/execute`,
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

  engine.adoptSlice(getOrCreateSearchEndpointSlice(sharableInterfaceId, thunk));

  return thunk;
}
