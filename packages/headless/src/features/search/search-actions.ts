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
  InstantResultSection,
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
  StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics';
import {getQueryInitialState} from '../query/query-state';
import {SearchAction} from '../analytics/analytics-utils';
import {extractHistory} from '../history/history-state';
import {getSearchInitialState} from './search-state';
import {logFetchMoreResults, logQueryError} from './search-analytics-actions';
import {
  MappedSearchRequest,
  mapSearchRequest,
  mapSearchResponse,
} from './search-mappings';
import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {updatePage} from '../pagination/pagination-actions';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {buildSearchRequest} from './search-request';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  FetchInstantResultsActionCreatorPayload,
  FetchInstantResultsThunkReturn,
  updateInstantResultsQuery,
} from '../instant-results/instant-results-actions';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {SearchRequestFeature} from '../../api/search/search-metadata';
import {RequestMetadata} from '../../api/preprocess-request';

export type StateNeededByExecuteSearch = ConfigurationSection &
  Partial<
    QuerySection &
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
  {request, mappings}: MappedSearchRequest,
  metadata: RequestMetadata
) => {
  const startedAt = new Date().getTime();
  const response = mapSearchResponse(
    await client.search(request, {metadata}),
    mappings
  );
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted, requestExecuted: request};
};

export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  UpdateQueryActionCreatorPayload,
  AsyncThunkOptions<StateNeededByExecuteSearch>
>('search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch} = thunk;
  validatePayload(payload, {
    q: new StringValue(),
    enableQuerySyntax: new BooleanValue(),
  });

  dispatch(deselectAllBreadcrumbs());
  dispatch(updateFacetAutoSelection({allow: true}));
  dispatch(updateQuery(payload));
  dispatch(updatePage(1));
});

const executeSearchFeature: SearchRequestFeature = 'search/executeSearch';
export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  executeSearchFeature,
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();
    addEntryInActionsHistory(state);
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      await buildSearchRequest(state),
      {feature: executeSearchFeature}
    );

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

const fetchPageFeature: SearchRequestFeature = 'search/fetchPage';
export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  fetchPageFeature,
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();
    addEntryInActionsHistory(state);
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      await buildSearchRequest(state),
      {feature: fetchPageFeature}
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
);

const fetchMoreResultsFeature: SearchRequestFeature = 'search/fetchMoreResults';
export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  fetchMoreResultsFeature,
  async (_, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildFetchMoreRequest(state),
      {feature: fetchMoreResultsFeature}
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
);

const fetchFacetValuesFeature: SearchRequestFeature = 'search/fetchFacetValues';
export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  fetchFacetValuesFeature,
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra: {apiClient}}
  ) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildFetchFacetValuesRequest(state),
      {feature: fetchFacetValuesFeature}
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

export const fetchInstantResults = createAsyncThunk<
  FetchInstantResultsThunkReturn,
  FetchInstantResultsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch & InstantResultSection>
>(
  'search/fetchInstantResults',
  async (
    payload: FetchInstantResultsActionCreatorPayload,
    {getState, dispatch, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
      q: requiredNonEmptyString,
      maxResultsPerQuery: new NumberValue({
        required: true,
        min: 1,
      }),
      cacheTimeout: new NumberValue(),
    });
    const {q, maxResultsPerQuery} = payload;
    const state = getState();

    const response = await fetchInstantResultsFromAPI(
      apiClient,
      state,
      q,
      maxResultsPerQuery
    );

    if (isErrorResponse(response)) {
      dispatch(logQueryError(response.error));
      return rejectWithValue(response.error);
    }

    if (!shouldReExecuteTheQueryWithCorrections(state, response.success)) {
      return {
        results: response.success.results,
      };
    }

    const {correctedQuery} = response.success.queryCorrections[0];

    dispatch(updateInstantResultsQuery({q: correctedQuery, id: payload.id}));

    const retried = await fetchInstantResultsFromAPI(
      apiClient,
      state,
      correctedQuery,
      maxResultsPerQuery
    );

    if (isErrorResponse(retried)) {
      dispatch(logQueryError(retried.error));
      return rejectWithValue(retried.error);
    }

    return {
      results: retried.success.results,
    };
  }
);

async function fetchInstantResultsFromAPI(
  apiClient: SearchAPIClient,
  state: StateNeededByExecuteSearch,
  q: string,
  numberOfResults: number
) {
  const {request, mappings} = await buildInstantResultSearchRequest(
    state,
    q,
    numberOfResults
  );
  return mapSearchResponse(
    await apiClient.search(request, {disableAbortWarning: true}),
    mappings
  );
}

const getStateAfterResponse: (
  query: string,
  duration: number,
  previousState: StateNeededByExecuteSearch,
  response: SearchResponseSuccess
) => StateNeededBySearchAnalyticsProvider = (
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
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<SearchAPIClient> & {
      searchAPIClient?: SearchAPIClient | undefined;
    },
    AnyAction
  >
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(
    client,
    getState(),
    await buildSearchRequest(getState()),
    {feature: executeSearchFeature}
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

export const buildInstantResultSearchRequest = async (
  state: StateNeededByExecuteSearch,
  q: string,
  numberOfResults: number
) => {
  const sharedWithFoldingRequest =
    await buildSearchAndFoldingLoadCollectionRequest(state);

  return mapSearchRequest({
    ...sharedWithFoldingRequest,
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
    numberOfResults,
    q,
  });
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
      ...(state.query?.q && {
        value: state.query.q,
      }),
      time: JSON.stringify(new Date()),
    });
  }
};

const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';
