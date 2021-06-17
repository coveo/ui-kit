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
import {updateQuery} from '../query/query-actions';
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
  getVisitorID,
  historyStore,
  StateNeededByAnalyticsProvider,
} from '../../api/analytics/analytics';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {SearchRequest} from '../../api/search/search/search-request';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {getQueryInitialState} from '../query/query-state';
import {SearchAction} from '../analytics/analytics-utils';
import {extractHistory} from '../history/history-state';
import {sortFacets} from '../../utils/facet-utils';
import {getSearchInitialState} from './search-state';
import {logFetchMoreResults, logQueryError} from './search-analytics-actions';

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
  request: SearchRequest
) => {
  const startedAt = new Date().getTime();
  const response = await client.search(request);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted, requestExecuted: request};
};

/**
 * Executes a search query.
 * @param analyticsAction (SearchAction) The analytics action to log after a successful query.
 */
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
    addEntryInActionsHistory(state);
    const fetched = await fetchFromAPI(
      extra.searchAPIClient,
      state,
      buildSearchRequest(state)
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
      extra.searchAPIClient,
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
  async (
    _,
    {getState, dispatch, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      searchAPIClient,
      state,
      buildFetchMoreRequest(state)
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
    buildSearchRequest(getState())
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

export const buildSearchRequest = (
  state: StateNeededByExecuteSearch
): SearchRequest => {
  const facets = getFacets(state);

  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    locale: state.configuration.search.locale,
    debug: state.debug,
    tab: state.configuration.analytics.originLevel2,
    referrer: state.configuration.analytics.originLevel3,
    ...(state.configuration.analytics.enabled && {
      visitorId: getVisitorID(),
    }),
    ...(state.advancedSearchQueries && {
      aq: state.advancedSearchQueries.aq,
      cq: state.advancedSearchQueries.cq,
    }),
    ...(state.context && {
      context: state.context.contextValues,
    }),
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
    ...(facets.length && {facets}),
    ...(state.fields && {
      fieldsToInclude: state.fields.fieldsToInclude,
    }),
    ...(state.pagination && {
      numberOfResults: state.pagination.numberOfResults,
      firstResult: state.pagination.firstResult,
    }),
    ...(state.pipeline && {
      pipeline: state.pipeline,
    }),
    ...(state.query && {
      q: state.query.q,
      enableQuerySyntax: state.query.enableQuerySyntax,
    }),
    ...(state.searchHub && {
      searchHub: state.searchHub,
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
    ...(state.facetOptions && {
      facetOptions: state.facetOptions,
    }),
    ...(state.folding?.enabled && {
      filterField: state.folding.fields.collection,
      childField: state.folding.fields.parent,
      parentField: state.folding.fields.child,
      filterFieldRange: state.folding.filterFieldRange,
    }),
  };
};

const buildFetchMoreRequest = (
  state: StateNeededByExecuteSearch
): SearchRequest => {
  const request = buildSearchRequest(state);
  return {
    ...request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.search?.results.length ?? 0),
  };
};

function getFacets(state: StateNeededByExecuteSearch) {
  return sortFacets(getAllFacets(state), state.facetOrder ?? []);
}

function getAllFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
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
