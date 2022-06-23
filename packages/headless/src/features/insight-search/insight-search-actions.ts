import {createAsyncThunk} from '../..';
import {isErrorResponse} from '../../api/search/search-api-client';
import {
  AsyncThunkInsightOptions,
  InsightAPIClient,
} from '../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {
  ConfigurationSection,
  FacetSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  PaginationSection,
  QuerySection,
  SearchSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {
  buildQuerySuggestRequest,
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
  StateNeededByQuerySuggest,
} from '../query-suggest/query-suggest-actions';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {logQueryError} from '../search/search-analytics-actions';

export type StateNeededByExecuteSearch = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    InsightCaseContextSection &
      SearchSection &
      QuerySection &
      FacetSection &
      PaginationSection
  >;

const fetchFromAPI = async (
  client: InsightAPIClient,
  state: StateNeededByExecuteSearch,
  request: InsightQueryRequest
) => {
  const startedAt = new Date().getTime();
  const response = await client.query(request);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted, requestExecuted: request};
};

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (
    analyticsAction: SearchAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    /** TODO: We need to dispatch analytics action, but first we have to create InsightClientProvider so the refactor will be available in  https://coveord.atlassian.net/browse/SVCC-2246*/
    const state = getState();
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      buildInsightSearchRequest(state)
    );

    if (isErrorResponse(fetched.response)) {
      dispatch(logQueryError(fetched.response.error));
      return rejectWithValue(fetched.response.error);
    }

    dispatch(snapshot(extractHistory(getState())));

    return {
      ...fetched,
      response: fetched.response.success,
      automaticallyCorrected: false,
      originalQuery: getOriginalQuery(state),
      analyticsAction,
    };
  }
);

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchMoreResults',
  async (_, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      buildInsightFetchMoreResultsRequest(state)
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

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
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
      buildInsightFetchFacetValuesRequest(state)
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

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkInsightOptions<StateNeededByQuerySuggest>
>(
  'querySuggest/fetch',

  async (payload: {id: string}, {getState, extra: {validatePayload}}) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const id = payload.id;
    const request = await buildQuerySuggestRequest(id, getState());

    // TODO: Fetch query suggestions from the platform when the back-end supports it.

    return {
      id,
      q: request.q,
      completions: [],
      responseId: '',
    };
  }
);

const buildInsightSearchRequest = (
  state: StateNeededByExecuteSearch
): InsightQueryRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.platformUrl,
    insightId: state.insightConfiguration.insightId,
    q: state.query?.q,
    facets: getFacetRequests(state.facetSet),
    caseContext: state.insightCaseContext?.caseContext,
    ...(state.pagination && {
      firstResult: state.pagination.firstResult,
      numberOfResults: state.pagination.numberOfResults,
    }),
  };
};

const buildInsightFetchMoreResultsRequest = (
  state: StateNeededByExecuteSearch
): InsightQueryRequest => {
  return {
    ...buildInsightSearchRequest(state),
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.pagination?.numberOfResults ?? 0),
  };
};

const buildInsightFetchFacetValuesRequest = (
  state: StateNeededByExecuteSearch
): InsightQueryRequest => {
  return {
    ...buildInsightSearchRequest(state),
    numberOfResults: 0,
  };
};

export const logFetchMoreResults = makeAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client) => client.logFetchMoreResults()
);

function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}

const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';
