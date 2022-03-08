import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {
  SearchAPIClient,
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {snapshot} from '../history/history-actions';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-analytics-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../query/query-actions';
import {
  AdvancedSearchQueriesSection,
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  DebugSection,
  DidYouMeanSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  NumericFacetSection,
  PaginationSection,
  PipelineSection,
  QuerySection,
  QuerySetSection,
  SearchHubSection,
  SearchSection,
  SortSection,
} from '../../state/state-sections';
import {
  historyStore,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {getQueryInitialState} from '../query/query-state';
import {SearchAction} from '../analytics/analytics-utils';
import {extractHistory} from '../history/history-state';
import {getSearchInitialState} from './search-state';
import {logFetchMoreResults, logQueryError} from './search-analytics-actions';
import {MappedSearchRequest, mapSearchResponse} from './search-mappings';
import {updatePage} from '../pagination/pagination-actions';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {buildSearchRequest} from './search-request';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions';
import {currentQuerySelector} from '../query/query-selectors';
import {deepEqualAnyOrder} from '../../utils/compare-utils';

export type StateNeededByExecuteSearch = ConfigurationSection &
  QuerySection &
  SearchSection &
  Partial<
    AdvancedSearchQueriesSection &
      PaginationSection &
      SortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      ContextSection &
      DidYouMeanSection &
      FieldsSection &
      PipelineSection &
      SearchHubSection &
      QuerySetSection &
      FacetOptionsSection &
      FacetOrderSection &
      DebugSection &
      SearchSection &
      FoldingSection
  >;

export interface ExecuteSearchThunkReturn {
  /** The successful search response. */
  response: SearchResponseSuccess;
  /** The number of milliseconds it took to receive the response. */
  duration: number;
  /** The query that was executed. */
  queryExecuted: string;
  /** Whether the query was automatically corrected. */
  automaticallyCorrected: boolean;
  /** The original query that was performed when an automatic correction is executed.*/
  originalQuery: string;
  /** The analytics action to log after the query. */
  analyticsAction: SearchAction;
}

const fetchFromAPI = async (
  client: SearchAPIClient,
  state: StateNeededByExecuteSearch,
  {request, mappings}: MappedSearchRequest
) => {
  const startedAt = new Date().getTime();
  const response = mapSearchResponse(await client.search(request), mappings);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted, requestExecuted: request};
};

export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  UpdateQueryActionCreatorPayload,
  AsyncThunkOptions<StateNeededByExecuteSearch>
>('search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch, getState} = thunk;
  const {calls, ...currentQueryState} = currentQuerySelector(getState());
  dispatch(
    updateQuery({
      ...payload,
      calls: deepEqualAnyOrder(currentQueryState, payload) ? calls : 0,
    })
  );
  dispatch(deselectAllBreadcrumbs());
  dispatch(updateFacetAutoSelection({allow: true}));
  dispatch(updatePage(1));
});

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();
    const {calls} = currentQuerySelector(state);

    if (calls > 2) {
      return {
        ...state.search,
        response: state.search.response,
        automaticallyCorrected: false,
        originalQuery: getOriginalQuery(state),
        analyticsAction,
      };
    }
    addEntryInActionsHistory(state);
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      await buildSearchRequest(state)
    );

    increaseCallCount(state, dispatch);

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
        analyticsAction,
      };
    }
    const {correctedQuery} = fetched.response.success.queryCorrections[0];
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

    const fetchedResponse = fetched.response.success;
    analyticsAction(
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
);

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/fetchMoreResults',
  async (_, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildFetchMoreRequest(state)
    );

    increaseCallCount(state, dispatch);

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
);

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra: {apiClient}}
  ) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildFetchFacetValuesRequest(state)
    );

    if (isErrorResponse(fetched.response)) {
      dispatch(logQueryError(fetched.response.error));
      return rejectWithValue(fetched.response.error);
    }

    dispatch(snapshot(extractHistory(state)));

    return {
      ...fetched,
      analyticsAction,
      response: fetched.response.success,
      automaticallyCorrected: false,
      originalQuery: getOriginalQuery(state),
    };
  }
);

const getStateAfterResponse: (
  query: string,
  duration: number,
  previousState: StateNeededByExecuteSearch,
  response: SearchResponseSuccess
) => StateNeededByAnalyticsProvider = (
  query,
  duration,
  previousState,
  response
) => ({
  ...previousState,
  query: {
    q: query,
    enableQuerySyntax:
      previousState.query?.enableQuerySyntax ??
      getQueryInitialState().enableQuerySyntax,
    calls: previousState.query.calls,
  },
  search: {
    ...getSearchInitialState(),
    duration,
    response,
    results: response.results,
  },
});

const automaticallyRetryQueryWithCorrection = async (
  client: SearchAPIClient,
  correction: string,
  getState: () => StateNeededByExecuteSearch,
  dispatch: ThunkDispatch<never, never, AnyAction>
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(
    client,
    getState(),
    await buildSearchRequest(getState())
  );
  dispatch(applyDidYouMeanCorrection(correction));
  return fetched;
};

const shouldReExecuteTheQueryWithCorrections = (
  state: StateNeededByExecuteSearch,
  res: SearchResponseSuccess
) => {
  if (
    state.didYouMean?.enableDidYouMean === true &&
    res.results.length === 0 &&
    res.queryCorrections.length !== 0
  ) {
    return true;
  }
  return false;
};

const buildFetchMoreRequest = async (
  state: StateNeededByExecuteSearch
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state);
  mappedRequest.request = {
    ...mappedRequest.request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.search?.results.length ?? 0),
  };
  return mappedRequest;
};

const buildFetchFacetValuesRequest = async (
  state: StateNeededByExecuteSearch
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state);
  // Specifying a numberOfResults of 0 will not log the query as a full fledged query in the API
  // it will also alleviate the load on the index
  mappedRequest.request.numberOfResults = 0;
  return mappedRequest;
};

const addEntryInActionsHistory = (state: StateNeededByExecuteSearch) => {
  if (state.configuration.analytics.enabled) {
    historyStore.addElement({
      name: 'Query',
      value: state.query?.q || getQueryInitialState().q,
      time: JSON.stringify(new Date()),
    });
  }
};

const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';

const increaseCallCount = (
  state: StateNeededByExecuteSearch,
  dispatch: ThunkDispatch<never, never, AnyAction>
) => {
  const {calls, ...currentQueryState} = currentQuerySelector(state);
  dispatch(
    updateQuery({
      ...currentQueryState,
      calls: (calls || 0) + 1,
    })
  );
};
