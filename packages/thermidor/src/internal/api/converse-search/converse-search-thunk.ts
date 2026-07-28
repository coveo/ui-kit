import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {CoveoConversationEndpointRequest} from '@/src/internal/api/conversation/conversation-endpoint-types.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {createCommerceSearchEndpointRequestSelector} from '@/src/internal/api/commerce-search/commerce-search-request-selector.js';
import {createCommerceSearchEndpointResponseHandler} from '@/src/internal/api/commerce-search/commerce-search-response-handler.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {getOrCreateGenerativeSelectors} from '@/src/internal/features/generative/index.js';
import {getOrCreateCartSelectors} from '@/src/internal/features/cart/index.js';
import {createConversationEndpointClient} from '@/src/internal/api/conversation/index.js';
import {getOrCreateCommerceSearchEndpointSlice} from '@/src/internal/api/commerce-search/commerce-search-thunk-slice.js';
import {extractCommerceSearchResponseFromStream} from './converse-commerce-search-stream-extractor.js';

export function createConverseSearchEndpointThunk(
  engine: FullEngine,
  scope: EndpointStateScope,
  generativeInterface: InterfaceHandle
) {
  const configSelectors = getOrCreateConfigurationSelectors();
  const buildRequest = createCommerceSearchEndpointRequestSelector(scope);
  const generativeSelectors = getOrCreateGenerativeSelectors(generativeInterface);
  const cartSelectors = getOrCreateCartSelectors(generativeInterface);
  const handleResponse = createCommerceSearchEndpointResponseHandler(scope.baseInterface);

  const {stateId} = getHandleInternals(scope.scopeInterface);

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/converseSearchEndpoint/execute`,
    async ({engine}) => {
      const request = engine.read(buildRequest);
      const conversationSessionId = engine.read(generativeSelectors.getConversationSessionId);
      const conversationToken = engine.read(generativeSelectors.getConversationToken);
      const cart = engine.read(cartSelectors.getCartContext);
      const navigatorContext = engine.getNavigatorContextProvider()?.();

      const converseRequest: CoveoConversationEndpointRequest = {
        trackingId: request.trackingId,
        language: request.language,
        country: request.country,
        currency: request.currency,
        message: request.query,
        page: request.page,
        perPage: request.perPage,
        ...(request.sort.length > 0 ? {sort: request.sort} : {}),
        ...(request.facets.length > 0 ? {facets: request.facets} : {}),
        clientId: navigatorContext?.clientId,
        context: {
          user: {
            userAgent: navigatorContext?.userAgent ?? null,
          },
          view: {
            url: navigatorContext?.location ?? null,
            referrer: navigatorContext?.referrer ?? null,
          },
          ...(cart ? {cart} : {}),
        },
        ...(conversationSessionId ? {conversationSessionId} : {}),
        ...(conversationToken ? {conversationToken} : {}),
        targetEngine: 'AGENT_CORE',
      };

      const config = engine.read(configSelectors.getEndpointClientConfiguration);
      const result = await createConversationEndpointClient().call(converseRequest, config);

      if (!result.success) {
        throw new Error(result.error);
      }

      const response = await extractCommerceSearchResponseFromStream(result.data.stream);
      handleResponse(engine, response);
    }
  );

  engine.adoptSlice(getOrCreateCommerceSearchEndpointSlice(scope.scopeInterface, thunk));

  return thunk;
}
