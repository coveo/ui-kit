import {createAsyncThunk} from '../..';
import {
  historyStore,
  StateNeededByInsightAnalyticsProvider,
} from '../../api/analytics/insight-analytics';
import {isErrorResponse} from '../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {
  AsyncThunkInsightOptions,
  InsightAPIClient,
} from '../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {
  ConfigurationSection,
  DateFacetSection,
  FacetSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  PaginationSection,
  QuerySection,
  SearchSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {InsightAction} from '../analytics/analytics-utils';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {
  buildQuerySuggestRequest,
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
  StateNeededByQuerySuggest,
} from '../query-suggest/query-suggest-actions';
import {getQueryInitialState} from '../query/query-state';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {getSearchInitialState} from '../search/search-state';
import {
  logFetchMoreResults,
  logQueryError,
} from './insight-search-analytics-actions';

export type StateNeededByExecuteSearch = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    InsightCaseContextSection &
      SearchSection &
      QuerySection &
      FacetSection &
      DateFacetSection &
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
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (
    analyticsAction: InsightAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();
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
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (
    analyticsAction: InsightAction,
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
    facets: getFacetRequests({
      ...state.facetSet,
      ...state.dateFacetSet,
    }),
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

function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}

const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';

const getStateAfterResponse: (
  query: string,
  duration: number,
  previousState: StateNeededByExecuteSearch,
  response: SearchResponseSuccess
) => StateNeededByInsightAnalyticsProvider = (
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
