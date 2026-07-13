import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CommerceSearchRequest} from '@/src/internal/api/commerce-search/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {createCommerceSearchEndpointRequestSelector} from './commerce-search-request-selector.js';
import {createCommerceSearchEndpointResponseHandler} from './commerce-search-response-handler.js';
import {readEndpointClientConfiguration} from '@/src/internal/features/configuration/index.js';
import {createCommerceSearchEndpointClient} from '@/src/internal/api/commerce-search/index.js';
import {getOrCreateCommerceSearchEndpointSlice} from './commerce-search-thunk-slice.js';

export function createCommerceSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope
) {
  const {stateId} = getHandleInternals(scope.scopeInterface);
  const buildRequest = createCommerceSearchEndpointRequestSelector(scope);
  const handleResponse = createCommerceSearchEndpointResponseHandler(
    scope.baseInterface
  );

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/commerceSearchEndpoint/execute`,
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
    getOrCreateCommerceSearchEndpointSlice(scope.scopeInterface, thunk)
  );

  return thunk;
}
