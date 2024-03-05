import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {historyStore} from '../../api/analytics/coveo-analytics-utils';
import {StateNeededByInsightAnalyticsProvider} from '../../api/analytics/insight-analytics';
import {
  SearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
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
  ContextSection,
  DateFacetSection,
  DidYouMeanSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  NumericFacetSection,
  PaginationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchSection,
  SortSection,
  TabSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {InsightAction as LegacyInsightAction} from '../analytics/analytics-utils';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {logDidYouMeanAutomatic} from '../did-you-mean/did-you-mean-insight-analytics-actions';
import {emptyLegacyCorrection} from '../did-you-mean/did-you-mean-state';
import {snapshot} from '../history/history-actions';
import {extractHistory} from '../history/history-state';
import {
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
} from '../query-suggest/query-suggest-actions';
import {updateQuery} from '../query/query-actions';
import {getQueryInitialState} from '../query/query-state';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {
  MappedSearchRequest,
  mapSearchResponse,
} from '../search/search-mappings';
import {getSearchInitialState} from '../search/search-state';
import {buildInsightQuerySuggestRequest} from './insight-query-suggest-request';
import {logQueryError} from './insight-search-analytics-actions';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from './insight-search-request';
import {
  legacyExecuteSearch,
  legacyFetchPage,
  legacyFetchFacetValues,
  legacyFetchMoreResults,
} from './legacy/insight-search-actions';

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
      TabSection &
      FieldsSection &
      DidYouMeanSection &
      SortSection &
      FoldingSection &
      ContextSection
  >;

export const fetchFromAPI = async (
  client: InsightAPIClient,
  state: StateNeededByExecuteSearch,
  {request, mappings}: MappedSearchRequest<InsightQueryRequest>,
  options?: SearchOptions
) => {
  const startedAt = new Date().getTime();
  const response = mapSearchResponse(
    await client.query(request, options),
    mappings
  );
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {
    response,
    duration,
    queryExecuted,
    requestExecuted: request,
  };
};

export interface InsightSearchAction<
  State extends StateNeededByExecuteSearch = StateNeededByExecuteSearch,
  Payload extends Object = {},
> {
  actionCause: string;
  getEventExtraPayload: (state: State) => Payload;
}

interface TransitiveInsightSearchAction {
  legacy: LegacyInsightAction;
  next?: InsightSearchAction;
}

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (analyticsAction: TransitiveInsightSearchAction, config) => {
    const {extra, dispatch, getState, rejectWithValue} = config;
    const state = getState();
    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyExecuteSearch(
        state,
        {extra, dispatch, getState, rejectWithValue},
        analyticsAction.legacy
      );
    }

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
        analyticsAction: analyticsAction.legacy,
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
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchPage',
  async (
    analyticsAction: TransitiveInsightSearchAction,
    {getState, dispatch, rejectWithValue, extra}
  ) => {
    const state = getState();

    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyFetchPage(
        state,
        {extra, dispatch, getState, rejectWithValue},
        analyticsAction.legacy
      );
    }

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
    };
  }
);

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchMoreResults',
  async (_, {extra, dispatch, getState, rejectWithValue}) => {
    const state = getState();

    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyFetchMoreResults(state, {
        extra,
        dispatch,
        getState,
        rejectWithValue,
      });
    }

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
    };
  }
);

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (
    analyticsAction: TransitiveInsightSearchAction,
    {extra, dispatch, getState, rejectWithValue}
  ) => {
    const state = getState();

    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyFetchFacetValues(
        state,
        {extra, dispatch, getState, rejectWithValue},
        analyticsAction.legacy
      );
    }

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
    };
  }
);

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkInsightOptions<StateNeededByQuerySuggest>
>(
  'querySuggest/fetch',
  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const id = payload.id;
    const request = await buildInsightQuerySuggestRequest(id, getState());
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id,
      q: request.q,
      ...response.success,
    };
  }
);

export type StateNeededByQuerySuggest = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    ConfigurationSection &
      QuerySuggestionSection &
      QuerySetSection &
      InsightCaseContextSection
  >;

export const automaticallyRetryQueryWithCorrection = async (
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
    await buildInsightSearchRequest(getState())
  );
  dispatch(applyDidYouMeanCorrection(correction));
  return fetched;
};

export const shouldReExecuteTheQueryWithCorrections = (
  state: StateNeededByExecuteSearch,
  res: SearchResponseSuccess
) => {
  if (
    state.didYouMean?.enableDidYouMean === true &&
    res.results.length === 0 &&
    res.queryCorrections &&
    res.queryCorrections.length !== 0
  ) {
    return true;
  }
  return false;
};

export const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';

export const getStateAfterResponse: (
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

export const addEntryInActionsHistory = (state: StateNeededByExecuteSearch) => {
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
