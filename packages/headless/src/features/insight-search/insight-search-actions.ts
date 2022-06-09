import {createAsyncThunk} from '../..';
import {isErrorResponse} from '../../api/search/search-api-client';
import {
  AsyncThunkInsightOptions,
  InsightAPIClient,
} from '../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {InsightQueryResponse} from '../../api/service/insight/query/query-response';
import {
  ConfigurationSection,
  FacetSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  InsightSearchSection,
  PaginationSection,
  QuerySection,
} from '../../state/state-sections';
import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {logQueryError} from '../search/search-analytics-actions';

export interface InsightExecuteSearchThunkReturn {
  /** The successful query response. */
  response: InsightQueryResponse;
  /** The number of milliseconds it took to receive the response. */
  duration: number;
  /** The query that was executed. */
  queryExecuted: string;
  /** The analytics action to log after the query. */
  analyticsAction: SearchAction;
}

export type StateNeededByExecuteSearch = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    InsightCaseContextSection &
      InsightSearchSection &
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

export const insightExecuteSearch = createAsyncThunk<
  InsightExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'insight/search/executeSearch',
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
      analyticsAction,
    };
  }
);

export const insightFetchMoreResults = createAsyncThunk<
  InsightExecuteSearchThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'insight/search/fetchMoreResults',
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
      analyticsAction: logFetchMoreResults(),
    };
  }
);

export const insightFetchFacetValues = createAsyncThunk<
  InsightExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'insight/search/fetchFacetValues',
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
      analyticsAction,
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
