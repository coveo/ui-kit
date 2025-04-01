import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {EventDescription} from 'coveo.analytics';
import {historyStore} from '../../../api/analytics/coveo-analytics-utils.js';
import {AsyncThunkSearchOptions} from '../../../api/search/search-api-client.js';
import {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import {AsyncThunkOptions} from '../../../app/async-thunk-options.js';
import {InstantResultSection} from '../../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {
  AnalyticsAsyncThunk,
  LegacySearchAction,
} from '../../analytics/analytics-utils.js';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions.js';
import {updateFacetAutoSelection} from '../../facets/generic/facet-actions.js';
import {logInstantResultsSearch} from '../../instant-results/instant-result-analytics-actions.js';
import {
  FetchInstantResultsActionCreatorPayload,
  FetchInstantResultsThunkReturn,
  updateInstantResultsQuery,
} from '../../instant-results/instant-results-actions.js';
import {updatePage} from '../../pagination/pagination-actions.js';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../../query/query-actions.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../../search-and-folding/legacy/search-and-folding-request.js';
import {logFetchMoreResults} from '../search-analytics-actions.js';
import {MappedSearchRequest, mapSearchRequest} from '../search-mappings.js';
import {
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor.js';
import {buildSearchRequest} from './search-request.js';

export type {StateNeededByExecuteSearch} from './search-actions-thunk-processor.js';

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
  analyticsAction: AnalyticsAsyncThunk;
}

interface PrepareForSearchWithQueryOptions {
  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended & can lead to an increasing number of queries returning no results.
   */
  clearFilters: boolean;
}

export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  UpdateQueryActionCreatorPayload & PrepareForSearchWithQueryOptions,
  AsyncThunkOptions<StateNeededByExecuteSearch>
>('search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch} = thunk;
  validatePayload(payload, {
    q: new StringValue(),
    enableQuerySyntax: new BooleanValue(),
    clearFilters: new BooleanValue(),
  });

  if (payload.clearFilters) {
    dispatch(deselectAllBreadcrumbs());
    dispatch(deselectAllNonBreadcrumbs());
  }

  dispatch(updateFacetAutoSelection({allow: true}));
  dispatch(
    updateQuery({q: payload.q, enableQuerySyntax: payload.enableQuerySyntax})
  );
  dispatch(updatePage(1));
});

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  LegacySearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/executeSearch', async (searchAction: LegacySearchAction, config) => {
  const state = config.getState();
  return await legacyExecuteSearch(state, config, searchAction);
});

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  LegacySearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchPage', async (searchAction: LegacySearchAction, config) => {
  const state = config.getState();
  return await legacyFetchPage(state, config, searchAction);
});

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config) => {
  const state = config.getState();

  return await legacyFetchMoreResults(config, state);
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  LegacySearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (searchAction: LegacySearchAction, config) => {
    const state = config.getState();

    return await legacyFetchFacetValues(config, searchAction, state);
  }
);

export const fetchInstantResults = createAsyncThunk<
  FetchInstantResultsThunkReturn,
  FetchInstantResultsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch & InstantResultSection>
>(
  'search/fetchInstantResults',
  async (payload: FetchInstantResultsActionCreatorPayload, config) => {
    return legacyFetchInstantResults(payload, config);
  }
);

const buildFetchMoreRequest = async (
  state: StateNeededByExecuteSearch,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state, eventDescription);
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
  state: StateNeededByExecuteSearch,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state, eventDescription);
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

export async function legacyFetchInstantResults(
  payload: FetchInstantResultsActionCreatorPayload,
  config: any //eslint-disable-line @typescript-eslint/no-explicit-any
) {
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
  const state = config.getState();

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction: logInstantResultsSearch()}, (modification) => {
    config.dispatch(
      updateInstantResultsQuery({q: modification, id: payload.id})
    );
  });

  const request = await buildInstantResultSearchRequest(
    state,
    q,
    maxResultsPerQuery
  );

  const fetched = await processor.fetchFromAPI(request, {
    origin: 'instantResults',
    disableAbortWarning: true,
  });
  const processed = await processor.process(fetched);
  if ('response' in processed) {
    return {
      results: processed.response.results,
      searchUid: processed.response.searchUid,
      analyticsAction: processed.analyticsAction,
      totalCountFiltered: processed.response.totalCountFiltered,
      duration: processed.duration,
    };
  }
  return processed as ReturnType<typeof config.rejectWithValue>;
}

export async function legacyFetchPage(
  state: StateNeededByExecuteSearch,
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  searchAction: LegacySearchAction
) {
  addEntryInActionsHistory(state);

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await searchAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: searchAction,
  });

  const request = await buildSearchRequest(state, eventDescription);
  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
}

export async function legacyFetchMoreResults(
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  state: StateNeededByExecuteSearch
) {
  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await logFetchMoreResults().prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: logFetchMoreResults(),
  });

  const request = await buildFetchMoreRequest(state, eventDescription);
  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
}

export async function legacyFetchFacetValues(
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  searchAction: LegacySearchAction,
  state: StateNeededByExecuteSearch
) {
  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await searchAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction: searchAction});

  const request = await buildFetchFacetValuesRequest(state, eventDescription);
  const fetched = await processor.fetchFromAPI(request, {
    origin: 'facetValues',
  });

  return await processor.process(fetched);
}

export async function legacyExecuteSearch(
  state: StateNeededByExecuteSearch,
  config: any, //eslint-disable-line @typescript-eslint/no-explicit-any
  searchAction: LegacySearchAction
) {
  addEntryInActionsHistory(state);

  const {analyticsClientMiddleware, preprocessRequest, logger} = config.extra;
  const {description: eventDescription} = await searchAction.prepare({
    getState: () => config.getState(),
    analyticsClientMiddleware,
    preprocessRequest,
    logger,
  });

  const request = await buildSearchRequest(state, eventDescription);

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction: searchAction});

  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
}
