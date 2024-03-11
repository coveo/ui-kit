import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../../api/service/insight/insight-api-client';
import {InsightAction} from '../../analytics/analytics-utils';
import {ExecuteSearchThunkReturn} from '../../search/legacy/search-actions';
import {
  StateNeededByExecuteSearch,
  addEntryInActionsHistory,
} from '../insight-search-actions';
import {logFetchMoreResults} from '../insight-search-analytics-actions';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from '../insight-search-request';
import {AsyncInsightSearchThunkProcessor} from './insight-search-actions-thunk-processor';

export async function legacyExecuteSearch(
  state: StateNeededByExecuteSearch,
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);

  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const mappedRequest = buildInsightSearchRequest(state);
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchPage(
  state: StateNeededByExecuteSearch,
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);

  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const mappedRequest = buildInsightSearchRequest(state);
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchMoreResults(
  state: StateNeededByExecuteSearch,
  config: any //eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: logFetchMoreResults,
  });

  const mappedRequest = await buildInsightFetchMoreResultsRequest(state);
  const fetched = await processor.fetchFromAPI(mappedRequest);

  return await processor.process(fetched, mappedRequest);
}

export async function legacyFetchFacetValues(
  state: StateNeededByExecuteSearch,
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  const processor = new AsyncInsightSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const mappedRequest = await buildInsightFetchFacetValuesRequest(state);
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
