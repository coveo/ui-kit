import {createAsyncThunk} from '@reduxjs/toolkit';
import type {InterfaceHandle, EndpointThunkArg} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {createUnifiedEndpointClient} from './unified-endpoint-client.js';
import {getOrCreateCommerceSearchEndpointSlice} from '@/src/internal/api/commerce-search/commerce-search-thunk-slice.js';
import {createUnifiedSearchRequestBuilder} from './unified-search-request-builder.js';
import {createUnifiedSearchResponseHandler} from './unified-search-response-handler.js';

export function createUnifiedSearchEndpointThunk(
  iface: InterfaceHandle,
  generativeInterface: InterfaceHandle,
  cartInterface: InterfaceHandle,
  surfaceId: string
) {
  const {engine, stateId} = getInterfaceInternals(iface);
  const configSelectors = getOrCreateConfigurationSelectors();
  const buildRequest = createUnifiedSearchRequestBuilder(
    generativeInterface,
    cartInterface,
    surfaceId
  );
  const handleResponse = createUnifiedSearchResponseHandler(iface);

  const thunk = createAsyncThunk<void, EndpointThunkArg>(
    `${stateId}/unifiedSearchEndpoint/execute`,
    async ({engine, actionIntent}) => {
      if (!actionIntent) {
        throw new Error('Unified search thunk requires an actionIntent');
      }

      const request = buildRequest(engine, actionIntent);
      const config = engine.read(configSelectors.getEndpointClientConfiguration);
      const result = await createUnifiedEndpointClient().call(request, config);

      if (!result.success) {
        throw new Error(result.error);
      }

      await handleResponse(engine, result.data.stream);
    }
  );

  engine.adoptSlice(getOrCreateCommerceSearchEndpointSlice(iface, thunk));

  return thunk;
}
