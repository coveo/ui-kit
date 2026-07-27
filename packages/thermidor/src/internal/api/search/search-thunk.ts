import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {createSearchEndpointRequestSelector} from './search-request-selector.js';
import {createSearchEndpointResponseHandler} from './search-response-handler.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import {createSearchEndpointClient} from '@/src/internal/api/search/index.js';
import {getOrCreateSearchEndpointSlice} from './search-thunk-slice.js';
import {buildAnalyticsParams} from '@/src/internal/api/analytics-params.js';

export function createSearchEndpointThunk(engine: FullEngine, scope: EndpointStateScope) {
  const {stateId} = getHandleInternals(scope.scopeInterface);
  const buildRequest = createSearchEndpointRequestSelector(scope);
  const handleResponse = createSearchEndpointResponseHandler(scope.baseInterface);
  const configSelectors = getOrCreateConfigurationSelectors();

  const thunk = createAsyncThunk<void, {engine: FullEngine}>(
    `${stateId}/searchEndpoint/execute`,
    async ({engine}) => {
      const request = engine.read(buildRequest);
      const trackingId = engine.read(configSelectors.getTrackingId);
      const config = engine.read(configSelectors.getEndpointClientConfiguration);

      const analytics = buildAnalyticsParams(engine, {
        originContext: 'Search',
        trackingId,
      });

      const fullRequest = {
        ...request,
        ...(analytics && {analytics}),
      };

      const response = await createSearchEndpointClient().call(fullRequest, config);

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.data) {
        handleResponse(engine, response.data);
      }
    }
  );

  engine.adoptSlice(getOrCreateSearchEndpointSlice(scope.scopeInterface, thunk));

  return thunk;
}
