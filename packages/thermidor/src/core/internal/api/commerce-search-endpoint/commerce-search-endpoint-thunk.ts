import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CommerceSearchRequest} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';
import {createCommerceSearchEndpointRequestSelector} from './commerce-search-endpoint-request-selector.js';
import {createCommerceSearchEndpointResponseHandler} from './commerce-search-endpoint-response-handler.js';
import {readEndpointClientConfiguration} from '@/src/core/internal/configuration/configuration-reader.js';
import {createCommerceSearchEndpointClient} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-client.js';
import {getOrCreateCommerceSearchEndpointSlice} from './commerce-search-endpoint-thunk-slice.js';

export function createCommerceSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope
) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const buildRequest = createCommerceSearchEndpointRequestSelector(scope);
  const handleResponse = createCommerceSearchEndpointResponseHandler(
    scope.interfaceId
  );

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${sharableInterfaceId}/commerceSearchEndpoint/execute`,
    async ({engine}) => {
      const request = engine.read(buildRequest);
      const navigatorContext = engine.getNavigatorContextProvider()?.();
      const fullRequest: CommerceSearchRequest = {
        trackingId: request.trackingId,
        language: request.language,
        country: request.country,
        currency: request.currency,
        query: request.query,
        page: request.page,
        perPage: request.perPage,
        ...(request.sort.length > 0 ? {sort: request.sort} : {}),
        clientId: navigatorContext?.clientId ?? undefined,
        context: {view: {url: navigatorContext?.location ?? ''}},
      };

      const config = readEndpointClientConfiguration(engine);
      const response = await createCommerceSearchEndpointClient().call(
        fullRequest,
        config
      );

      if (!response.success) {
        throw new Error(response.error);
      }
      if (response.data) {
        handleResponse(engine, response.data);
      }
    }
  );

  engine.adoptSlice(
    getOrCreateCommerceSearchEndpointSlice(sharableInterfaceId, thunk)
  );

  return thunk;
}
