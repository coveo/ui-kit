import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {EventDescription} from 'coveo.analytics';
import {historyStore} from '../../api/analytics/coveo-analytics-utils';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {InstantResultSection} from '../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {AnalyticsAsyncThunk, SearchAction} from '../analytics/analytics-utils';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions';
import {logInstantResultsSearch} from '../instant-results/instant-result-analytics-actions';
import {
  FetchInstantResultsActionCreatorPayload,
  FetchInstantResultsThunkReturn,
  updateInstantResultsQuery,
} from '../instant-results/instant-results-actions';
import {updatePage} from '../pagination/pagination-actions';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../query/query-actions';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor';
import {logFetchMoreResults} from './search-analytics-actions';
import {MappedSearchRequest, mapSearchRequest} from './search-mappings';
import {buildSearchRequest} from './search-request';

export type {StateNeededByExecuteSearch} from './search-actions-thunk-processor';

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
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/executeSearch', async (searchAction: SearchAction, config) => {
  const state = config.getState();
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
});

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchPage', async (searchAction: SearchAction, config) => {
  const state = config.getState();
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
});

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config) => {
  const state = config.getState();

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
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchFacetValues', async (searchAction: SearchAction, config) => {
  const state = config.getState();

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
});

export const fetchInstantResults = createAsyncThunk<
  FetchInstantResultsThunkReturn,
  FetchInstantResultsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch & InstantResultSection>
>(
  'search/fetchInstantResults',
  async (payload: FetchInstantResultsActionCreatorPayload, config) => {
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
    >(
      {...config, analyticsAction: logInstantResultsSearch()},
      (modification) => {
        config.dispatch(
          updateInstantResultsQuery({q: modification, id: payload.id})
        );
      }
    );

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
