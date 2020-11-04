import {createAsyncThunk, ThunkDispatch, AnyAction} from '@reduxjs/toolkit';
import {
  SearchAPIClient,
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';
import {SearchAction} from '../analytics/analytics-actions';
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
  DidYouMeanSection,
  FacetOptionsSection,
  FacetSection,
  FieldsSection,
  NumericFacetSection,
  PaginationSection,
  PipelineSection,
  QuerySection,
  QuerySetSection,
  SearchHubSection,
  SearchSection,
  SortSection,
} from '../../state/state-sections';
import {configureAnalytics, historyStore} from '../../api/analytics/analytics';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {SearchParametersState} from '../../state/search-app-state';
import {SearchRequest} from '../../api/search/search/search-request';
import {getContextInitialState} from '../context/context-state';
import {getFacetSetInitialState} from '../facets/facet-set/facet-set-state';
import {getNumericFacetSetInitialState} from '../facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {getDateFacetSetInitialState} from '../facets/range-facets/date-facet-set/date-facet-set-state';
import {getCategoryFacetSetInitialState} from '../facets/category-facet-set/category-facet-set-state';
import {getPaginationInitialState} from '../pagination/pagination-state';
import {getQueryInitialState} from '../query/query-state';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {getQuerySetInitialState} from '../query-set/query-set-state';
import {getSortCriteriaInitialState} from '../sort-criteria/sort-criteria-state';
import {getPipelineInitialState} from '../pipeline/pipeline-state';
import {getSearchHubInitialState} from '../search-hub/search-hub-state';
import {getFacetOptionsInitialState} from '../facet-options/facet-options-state';

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
      SearchSection
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
  /** The analytics action to log after the query. */
  analyticsAction: SearchAction;
}

const fetchFromAPI = async (
  client: SearchAPIClient,
  state: StateNeededByExecuteSearch
) => {
  const startedAt = new Date().getTime();
  const response = await client.search(buildSearchRequest(state));
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {response, duration, queryExecuted};
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
    {getState, dispatch, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    const state = getState();
    addEntryInActionsHistory(state);
    const fetched = await fetchFromAPI(searchAPIClient, state);

    if (isErrorResponse(fetched.response)) {
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
        analyticsAction,
      };
    }

    const retried = await automaticallyRetryQueryWithCorrection(
      searchAPIClient,
      fetched.response.success.queryCorrections[0].correctedQuery,
      getState,
      dispatch
    );

    dispatch(snapshot(extractHistory(getState())));

    if (isErrorResponse(retried.response)) {
      return rejectWithValue(retried.response.error);
    }

    return {
      ...retried,
      response: retried.response.success,
      automaticallyCorrected: true,
      analyticsAction,
    };
  }
);

const automaticallyRetryQueryWithCorrection = async (
  client: SearchAPIClient,
  correction: string,
  getState: () => StateNeededByExecuteSearch,
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>
) => {
  dispatch(updateQuery({q: correction}));
  const fetched = await fetchFromAPI(client, getState());
  dispatch(logDidYouMeanAutomatic());
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

const extractHistory = (
  state: StateNeededByExecuteSearch
): SearchParametersState => ({
  context: state.context || getContextInitialState(),
  facetSet: state.facetSet || getFacetSetInitialState(),
  numericFacetSet: state.numericFacetSet || getNumericFacetSetInitialState(),
  dateFacetSet: state.dateFacetSet || getDateFacetSetInitialState(),
  categoryFacetSet: state.categoryFacetSet || getCategoryFacetSetInitialState(),
  pagination: state.pagination || getPaginationInitialState(),
  query: state.query || getQueryInitialState(),
  advancedSearchQueries:
    state.advancedSearchQueries || getAdvancedSearchQueriesInitialState(),
  querySet: state.querySet || getQuerySetInitialState(),
  sortCriteria: state.sortCriteria || getSortCriteriaInitialState(),
  pipeline: state.pipeline || getPipelineInitialState(),
  searchHub: state.searchHub || getSearchHubInitialState(),
  facetOptions: state.facetOptions || getFacetOptionsInitialState(),
});

const countSearchResults = (state: StateNeededByExecuteSearch) =>
  state.search
    ? state.search.pastResponses?.reduce(
        (count, response) => count + response.results.length,
        0
      ) + state.search.response.results.length
    : 0;

export const buildSearchRequest = (
  state: StateNeededByExecuteSearch
): SearchRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    ...(state.configuration.analytics.enabled && {
      visitorId: configureAnalytics(state).coveoAnalyticsClient
        .currentVisitorId,
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
    ...(state.facetSet && {
      facets: getFacets(state),
    }),
    ...(state.fields && {
      fieldsToInclude: state.fields.fieldsToInclude,
    }),
    ...(state.pagination && {
      numberOfResults: state.pagination.numberOfResults,
      firstResult: state.pagination.firstResult,
    }),
    ...(state.search?.infiniteScrollingEnabled && {
      firstResult: countSearchResults(state),
    }),
    ...(state.pipeline && {
      pipeline: state.pipeline,
    }),
    ...(state.query && {
      q: state.query.q,
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
  };
};

function getFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetsInSameOrderAsResponse(state),
    ...getFacetsNotInResponse(state),
  ];
}

function getFacetsInSameOrderAsResponse(state: StateNeededByExecuteSearch) {
  const requests: AnyFacetRequest[] = [];
  if (!state.search) {
    return requests;
  }
  const responseFacets = state.search.response.facets;

  responseFacets.forEach((f) => {
    const request = findFacetRequest(state, f.facetId);
    request && requests.push(request);
  });

  return requests;
}

function findFacetRequest(state: StateNeededByExecuteSearch, facetId: string) {
  const sets = [
    state.facetSet,
    state.numericFacetSet,
    state.dateFacetSet,
    state.categoryFacetSet,
  ];

  const targetSet = sets.find((set) => set && set[facetId]);
  return targetSet ? targetSet[facetId] : undefined;
}

function getFacetsNotInResponse(state: StateNeededByExecuteSearch) {
  const excludedFacetIds = new Set<string>();
  const responseFacets = state.search?.response.facets;
  responseFacets?.forEach((f) => excludedFacetIds.add(f.facetId));

  return getAllFacets(state).filter((f) => !excludedFacetIds.has(f.facetId));
}

function getAllFacets(state: StateNeededByExecuteSearch) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
    ...getFacetRequests(state.categoryFacetSet),
  ];
}

function getFacetRequests(requests: Record<string, AnyFacetRequest> = {}) {
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
