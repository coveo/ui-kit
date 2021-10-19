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
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {getQueryInitialState} from '../query/query-state';
import {SearchAction} from '../analytics/analytics-utils';
import {extractHistory} from '../history/history-state';
import {sortFacets} from '../../utils/facet-utils';
import {getSearchInitialState} from './search-state';
import {logFetchMoreResults, logQueryError} from './search-analytics-actions';
import {
  MappedSearchRequest,
  mapSearchRequest,
  mapSearchResponse,
} from './search-mappings';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/build-search-request';
import {BooleanValue, StringValue} from '@coveo/bueno';
import {deselectAllFacets} from '../facets/generic/facet-actions';
import {updatePage} from '../pagination/pagination-actions';
import {validatePayload} from '../../utils/validate-payload';

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
  {request, mappings}: MappedSearchRequest
) => {
  const startedAt = new Date().getTime();
  const response = mapSearchResponse(await client.search(request), mappings);
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted, requestExecuted: request};
};

/**
 * Prepares the search state for a search with a query by setting the query string and resetting facet and pager states.
 * @param q (string) The new basic query expression (e.g., `acme tornado seeds`).
 * @param enableQuerySyntax (boolean) Whether to interpret advanced [Coveo Cloud query syntax](https://docs.coveo.com/en/1814/searching-with-coveo/search-prefixes-and-operators) in the query.
 */
export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  UpdateQueryActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch} = thunk;
  validatePayload(payload, {
    q: new StringValue(),
    enableQuerySyntax: new BooleanValue(),
  });

  dispatch(deselectAllFacets());
  dispatch(updateQuery(payload));
  dispatch(updatePage(1));
});

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
      extra.apiClient,
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

export const buildSearchRequest = (state: StateNeededByExecuteSearch) => {
  const facets = getFacets(state);
  const sharedWithFoldingRequest =
    buildSearchAndFoldingLoadCollectionRequest(state);

  return mapSearchRequest({
    ...sharedWithFoldingRequest,
    ...(state.didYouMean && {
      enableDidYouMean: state.didYouMean.enableDidYouMean,
    }),
    ...(facets.length && {facets}),
    ...(state.pagination && {
      numberOfResults: state.pagination.numberOfResults,
      firstResult: state.pagination.firstResult,
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
  });
};

const buildFetchMoreRequest = (
  state: StateNeededByExecuteSearch
): MappedSearchRequest => {
  const mappedRequest = buildSearchRequest(state);
  mappedRequest.request = {
    ...mappedRequest.request,
    firstResult:
      (state.pagination?.firstResult ?? 0) +
      (state.search?.results.length ?? 0),
  };
  return mappedRequest;
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
