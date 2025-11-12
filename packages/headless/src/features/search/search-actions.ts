import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {EventDescription} from 'coveo.analytics';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import type {SearchResponseSuccess} from '../../api/search/search/search-response.js';
import type {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {InstantResultSection} from '../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  type LegacySearchAction,
  makeBasicNewSearchAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../breadcrumb/breadcrumb-actions.js';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions.js';
import {searchboxAsYouType} from '../instant-results/instant-result-analytics-actions.js';
import {
  type FetchInstantResultsActionCreatorPayload,
  type FetchInstantResultsThunkReturn,
  updateInstantResultsQuery,
} from '../instant-results/instant-results-actions.js';
import {updatePage} from '../pagination/pagination-actions.js';
import {
  type UpdateQueryActionCreatorPayload,
  updateQuery,
} from '../query/query-actions.js';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request.js';
import {
  legacyExecuteSearch,
  legacyFetchInstantResults,
  legacyFetchMoreResults,
  legacyFetchPage,
} from './legacy/search-actions.js';
import {
  AsyncSearchThunkProcessor,
  type StateNeededByExecuteSearch,
} from './search-actions-thunk-processor.js';
import {type MappedSearchRequest, mapSearchRequest} from './search-mappings.js';
import {buildSearchRequest} from './search-request.js';

export interface SearchAction {
  actionCause: string;
}

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
}

export interface PrepareForSearchWithQueryOptions {
  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended and can lead to an increasing number of queries returning no results.
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

export interface TransitiveSearchAction {
  legacy: LegacySearchAction;
  next?: SearchAction;
}

export const updateSearchAction = createAction<SearchAction | undefined>(
  'search/updateSearchAction'
);

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveSearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (searchAction: TransitiveSearchAction, config) => {
    const state = config.getState();
    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyExecuteSearch(state, config, searchAction.legacy);
    }
    addEntryInActionsHistory(state);
    const analyticsAction = searchAction.next
      ? buildSearchReduxAction(searchAction.next)
      : undefined;

    const request = await buildSearchRequest(
      state,
      config.extra.navigatorContext,
      analyticsAction
    );

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction: analyticsAction ?? {}});

    const fetched = await processor.fetchFromAPI(request, {
      origin: 'mainSearch',
    });

    return await processor.process(fetched);
  }
);

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveSearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchPage', async (searchAction: TransitiveSearchAction, config) => {
  const state = config.getState();
  addEntryInActionsHistory(state);

  if (
    state.configuration.analytics.analyticsMode === 'legacy' ||
    !searchAction.next
  ) {
    return legacyFetchPage(state, config, searchAction.legacy);
  }

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: searchAction.next,
  });

  const request = await buildSearchRequest(
    state,
    config.extra.navigatorContext,
    searchAction.next
  );
  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
});

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config) => {
  const state = config.getState();
  if (state.configuration.analytics.analyticsMode === 'legacy') {
    return legacyFetchMoreResults(config, state);
  }

  const analyticsAction = makeBasicNewSearchAnalyticsAction(
    SearchPageEvents.browseResults,
    config.getState
  );

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const request = await buildFetchMoreRequest(
    state,
    config.extra.navigatorContext,
    analyticsAction
  );
  const fetched = await processor.fetchFromAPI(request, {origin: 'mainSearch'});

  return await processor.process(fetched);
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveSearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (searchAction: TransitiveSearchAction, config) => {
    const state = config.getState();
    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyExecuteSearch(state, config, searchAction.legacy);
    }

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction: {}});

    const request = await buildFetchFacetValuesRequest(
      state,
      config.extra.navigatorContext
    );
    const fetched = await processor.fetchFromAPI(request, {
      origin: 'facetValues',
    });

    return await processor.process(fetched);
  }
);

export const fetchInstantResults = createAsyncThunk<
  FetchInstantResultsThunkReturn,
  FetchInstantResultsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch & InstantResultSection>
>(
  'search/fetchInstantResults',
  async (payload: FetchInstantResultsActionCreatorPayload, config) => {
    const state = config.getState();
    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyFetchInstantResults(payload, config);
    }
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

    const analyticsAction = buildSearchReduxAction(searchboxAsYouType());

    const request = await buildInstantResultSearchRequest(
      state,
      config.extra.navigatorContext,
      q,
      maxResultsPerQuery,
      analyticsAction
    );

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction}, (modification) => {
      config.dispatch(
        updateInstantResultsQuery({q: modification, id: payload.id})
      );
    });
    const fetched = await processor.fetchFromAPI(request, {
      origin: 'instantResults',
      disableAbortWarning: true,
    });

    const processed = await processor.process(fetched);
    if ('response' in processed) {
      return {
        results: processed.response.results,
        searchUid: processed.response.searchUid,
        totalCountFiltered: processed.response.totalCountFiltered,
        duration: processed.duration,
      };
    }
    return processed as ReturnType<typeof config.rejectWithValue>;
  }
);

const buildFetchMoreRequest = async (
  state: StateNeededByExecuteSearch,
  navigatorContext: NavigatorContext,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(
    state,
    navigatorContext,
    eventDescription
  );
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
  navigatorContext: NavigatorContext,
  q: string,
  numberOfResults: number,
  eventDescription: EventDescription
) => {
  const sharedWithFoldingRequest = buildSearchAndFoldingLoadCollectionRequest(
    state,
    navigatorContext,
    eventDescription
  );

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
  navigatorContext: NavigatorContext,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(
    state,
    navigatorContext,
    eventDescription
  );
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

const buildSearchReduxAction = (action: SearchAction) => ({
  actionCause: action.actionCause,
  type: action.actionCause,
});
