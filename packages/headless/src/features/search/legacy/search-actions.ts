import {NumberValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {EventDescription} from 'coveo.analytics';
import HistoryStore from '../../../api/analytics/coveo.analytics/history-store.js';
import type {SearchResponseSuccess} from '../../../api/search/search/search-response.js';
import type {AsyncThunkSearchOptions} from '../../../api/search/search-api-client.js';
import type {InstantResultSection} from '../../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import type {
  AnalyticsAsyncThunk,
  LegacySearchAction,
} from '../../analytics/analytics-utils.js';
import {logInstantResultsSearch} from '../../instant-results/instant-result-analytics-actions.js';
import {
  type FetchInstantResultsActionCreatorPayload,
  type FetchInstantResultsThunkReturn,
  updateInstantResultsQuery,
} from '../../instant-results/instant-results-actions.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../../search-and-folding/legacy/search-and-folding-request.js';
import {logFetchMoreResults} from '../search-analytics-actions.js';
import {
  type MappedSearchRequest,
  mapSearchRequest,
} from '../search-mappings.js';
import {
  AsyncSearchThunkProcessor,
  type StateNeededByExecuteSearch,
} from './search-actions-thunk-processor.js';
import {buildSearchRequest} from './search-request.js';

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

const buildInstantResultSearchRequest = async (
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
    HistoryStore.getInstance().addElement({
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
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any
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
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
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
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
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

async function legacyFetchFacetValues(
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
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
  // biome-ignore lint/suspicious/noExplicitAny: <>
  config: any,
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
