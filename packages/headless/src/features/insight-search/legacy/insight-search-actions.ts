import {createAsyncThunk} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {AsyncThunkInsightOptions} from '../../../api/service/insight/insight-api-client';
import {InsightAction} from '../../analytics/analytics-utils';
import {logDidYouMeanAutomatic} from '../../did-you-mean/did-you-mean-insight-analytics-actions';
import {emptyLegacyCorrection} from '../../did-you-mean/did-you-mean-state';
import {snapshot} from '../../history/history-actions';
import {extractHistory} from '../../history/history-state';
import {ExecuteSearchThunkReturn} from '../../search/legacy/search-actions';
import {SuccessResponse, mapSearchResponse} from '../../search/search-mappings';
import {
  StateNeededByExecuteSearch,
  addEntryInActionsHistory,
  automaticallyRetryQueryWithCorrection,
  fetchFromAPI,
  getOriginalQuery,
  getStateAfterResponse,
  shouldReExecuteTheQueryWithCorrections,
} from '../insight-search-actions';
import {
  logFetchMoreResults,
  logQueryError,
} from '../insight-search-analytics-actions';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from '../insight-search-request';

export async function legacyExecuteSearch(
  state: StateNeededByExecuteSearch,
  {extra, dispatch, getState, rejectWithValue}: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);
  const mappedRequest = buildInsightSearchRequest(state);

  const fetched = await fetchFromAPI(extra.apiClient, state, mappedRequest);

  if (isErrorResponse(fetched.response)) {
    dispatch(logQueryError(fetched.response.error));
    return rejectWithValue(fetched.response.error);
  }

  if (
    !shouldReExecuteTheQueryWithCorrections(state, fetched.response.success)
  ) {
    dispatch(snapshot(extractHistory(state)));
    return {
      ...fetched,
      response: fetched.response.success,
      automaticallyCorrected: false,
      originalQuery: getOriginalQuery(state),
      analyticsAction: analyticsAction,
    };
  }
  const {correctedQuery} = fetched.response.success.queryCorrections
    ? fetched.response.success.queryCorrections[0]
    : emptyLegacyCorrection();
  const retried = await automaticallyRetryQueryWithCorrection(
    extra.apiClient,
    correctedQuery,
    getState,
    dispatch
  );

  if (isErrorResponse(retried.response)) {
    dispatch(logQueryError(retried.response.error));
    return rejectWithValue(retried.response.error);
  }

  const fetchedResponse = (
    mapSearchResponse(
      fetched.response,
      mappedRequest.mappings
    ) as SuccessResponse
  ).success;
  analyticsAction()(
    dispatch,
    () =>
      getStateAfterResponse(
        fetched.queryExecuted,
        fetched.duration,
        state,
        fetchedResponse
      ),
    extra
  );
  dispatch(snapshot(extractHistory(getState())));

  return {
    ...retried,
    response: {
      ...retried.response.success,
      queryCorrections: fetched.response.success.queryCorrections,
    },
    automaticallyCorrected: true,
    originalQuery: getOriginalQuery(state),
    analyticsAction: logDidYouMeanAutomatic(),
  };
}

export async function legacyFetchPage(
  state: StateNeededByExecuteSearch,
  {extra, dispatch, rejectWithValue}: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  addEntryInActionsHistory(state);

  const fetched = await fetchFromAPI(
    extra.apiClient,
    state,
    buildInsightSearchRequest(state)
  );

  if (isErrorResponse(fetched.response)) {
    dispatch(logQueryError(fetched.response.error));
    return rejectWithValue(fetched.response.error);
  }

  dispatch(snapshot(extractHistory(state)));
  return {
    ...fetched,
    response: fetched.response.success,
    automaticallyCorrected: false,
    originalQuery: getOriginalQuery(state),
    analyticsAction,
  };
}

export async function legacyFetchMoreResults(
  state: StateNeededByExecuteSearch,
  {extra, dispatch, rejectWithValue}: any //eslint-disable-line @typescript-eslint/no-explicit-any
) {
  const fetched = await fetchFromAPI(
    extra.apiClient,
    state,
    await buildInsightFetchMoreResultsRequest(state)
  );

  if (isErrorResponse(fetched.response)) {
    dispatch(logQueryError(fetched.response.error));
    return rejectWithValue(fetched.response.error);
  }

  dispatch(snapshot(extractHistory(state)));

  return {
    ...fetched,
    response: fetched.response.success,
    automaticallyCorrected: false,
    originalQuery: getOriginalQuery(state),
    analyticsAction: logFetchMoreResults(),
  };
}

export async function legacyFetchFacetValues(
  state: StateNeededByExecuteSearch,
  {extra, dispatch, rejectWithValue}: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  analyticsAction: InsightAction
) {
  const fetched = await fetchFromAPI(
    extra.apiClient,
    state,
    await buildInsightFetchFacetValuesRequest(state)
  );

  if (isErrorResponse(fetched.response)) {
    dispatch(logQueryError(fetched.response.error));
    return rejectWithValue(fetched.response.error);
  }

  dispatch(snapshot(extractHistory(state)));

  return {
    ...fetched,
    response: fetched.response.success,
    automaticallyCorrected: false,
    originalQuery: getOriginalQuery(state),
    analyticsAction,
  };
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
