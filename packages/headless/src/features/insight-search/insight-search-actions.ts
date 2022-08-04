import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
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
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  DidYouMeanSection,
  FacetSection,
  FieldsSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  NumericFacetSection,
  PaginationSection,
  QuerySection,
  SearchSection,
  TabSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {InsightAction} from '../analytics/analytics-utils';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-insight-analytics-actions';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {
  buildQuerySuggestRequest,
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
  StateNeededByQuerySuggest,
} from '../query-suggest/query-suggest-actions';
import {updateQuery} from '../query/query-actions';
import {getQueryInitialState} from '../query/query-state';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {
  MappedSearchRequest,
  mapSearchRequest,
  mapSearchResponse,
  SuccessResponse,
} from '../search/search-mappings';
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
      NumericFacetSection &
      DateFacetSection &
      CategoryFacetSection &
      PaginationSection &
      DidYouMeanSection &
      TabSection &
      FieldsSection
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

    const mappedRequest = buildInsightSearchRequest(state);
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      mappedRequest.request
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

    const fetchedResponse = (
      mapSearchResponse(
        fetched.response,
        mappedRequest.mappings
      ) as SuccessResponse
    ).success;
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

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  InsightAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchPage',
  async (
    analyticsAction: InsightAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();
    addEntryInActionsHistory(state);

    const mappedRequest = buildInsightSearchRequest(state);
    const fetched = await fetchFromAPI(
      extra.apiClient,
      state,
      mappedRequest.request
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
): MappedSearchRequest<InsightQueryRequest> => {
  const cq = buildConstantQuery(state);
  const facets = getAllFacets(state);
  return mapSearchRequest<InsightQueryRequest>({
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.platformUrl,
    insightId: state.insightConfiguration.insightId,
    q: state.query?.q,
    ...(facets.length && {facets}),
    caseContext: state.insightCaseContext?.caseContext,
    ...(state.pagination && {
      firstResult: state.pagination.firstResult,
      numberOfResults: state.pagination.numberOfResults,
    }),
    ...(cq && {cq}),
    ...(state.fields &&
      !state.fields.fetchAllFields && {
        fieldsToInclude: state.fields.fieldsToInclude,
      }),
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
  });
};

const buildInsightFetchMoreResultsRequest = (
  state: StateNeededByExecuteSearch
): InsightQueryRequest => {
  return {
    ...buildInsightSearchRequest(state).request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.pagination?.numberOfResults ?? 0),
  };
};

const buildInsightFetchFacetValuesRequest = (
  state: StateNeededByExecuteSearch
): InsightQueryRequest => {
  return {
    ...buildInsightSearchRequest(state).request,
    numberOfResults: 0,
  };
};

const automaticallyRetryQueryWithCorrection = async (
  client: InsightAPIClient,
  correction: string,
  getState: () => StateNeededByExecuteSearch,
  dispatch: ThunkDispatch<
    StateNeededByExecuteSearch,
    ClientThunkExtraArguments<InsightAPIClient> & {
      searchAPIClient?: InsightAPIClient | undefined;
    },
    AnyAction
  >
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(
    client,
    getState(),
    await buildInsightSearchRequest(getState()).request
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

function getAllFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetRequests({
      ...state.facetSet,
      ...state.numericFacetSet,
      ...state.dateFacetSet,
    }),
    ...getCategoryFacetRequests(state.categoryFacetSet),
  ];
}

function getCategoryFacetRequests(state: CategoryFacetSetState | undefined) {
  return Object.values(state || {}).map((slice) => slice!.request);
}
function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}

function buildConstantQuery(state: StateNeededByExecuteSearch) {
  const activeTab = Object.values(state.tabSet || {}).find(
    (tab) => tab.isActive
  );
  const tabExpression = activeTab?.expression.trim() || '';

  return tabExpression;
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
