import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkInsightOptions} from '../../../api/service/insight/insight-api-client.js';
import type {InsightAction} from '../../analytics/analytics-utils.js';
import type {ExecuteSearchThunkReturn} from '../../search/legacy/search-actions.js';
import {
  addEntryInActionsHistory,
  type StateNeededByExecuteSearch,
} from '../insight-search-actions.js';
import {logFetchMoreResults} from '../insight-search-analytics-actions.js';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from '../insight-search-request.js';
import {AsyncInsightSearchThunkProcessor} from './insight-search-actions-thunk-processor.js';

export async function legacyExecuteSearch(
  state: StateNeededByExecuteSearch,
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);

  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await analyticsAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const mappedRequest = await buildInsightSearchRequest(
    state,
    eventDescription
  );
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchPage(
  state: StateNeededByExecuteSearch,
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);

  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await analyticsAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const mappedRequest = await buildInsightSearchRequest(
    state,
    eventDescription
  );
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchMoreResults(
  state: StateNeededByExecuteSearch,
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any
) {
  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: logFetchMoreResults,
  });

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await logFetchMoreResults().prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const mappedRequest = await buildInsightFetchMoreResultsRequest(
    state,
    eventDescription
  );
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchFacetValues(
  state: StateNeededByExecuteSearch,
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
  analyticsAction: InsightAction
) {
  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await analyticsAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const mappedRequest = await buildInsightFetchFacetValuesRequest(
    state,
    eventDescription
  );
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>('search/executeSearch', async (analyticsAction: InsightAction, config) => {
  const state = config.getState();
  return await legacyExecuteSearch(state, config, analyticsAction);
});

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>('search/fetchPage', async (analyticsAction: InsightAction, config) => {
  const state = config.getState();
  return await legacyFetchPage(state, config, analyticsAction);
});

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config) => {
  const state = config.getState();
  return await legacyFetchMoreResults(state, config);
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>('search/fetchFacetValues', async (analyticsAction: InsightAction, config) => {
  const state = config.getState();
  return await legacyFetchFacetValues(state, config, analyticsAction);
});
