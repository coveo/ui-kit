import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {EventDescription} from 'coveo.analytics';
import {historyStore} from '../../api/analytics/coveo-analytics-utils';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {NavigatorContext} from '../../app/navigatorContextProvider';
import {InstantResultSection} from '../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {
  LegacySearchAction,
  makeBasicNewSearchAnalyticsAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions';
import {searchboxAsYouType} from '../instant-results/instant-result-analytics-actions';
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
  legacyExecuteSearch,
  legacyFetchInstantResults,
  legacyFetchMoreResults,
  legacyFetchPage,
} from './legacy/search-actions';
import {
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor';
import {MappedSearchRequest, mapSearchRequest} from './search-mappings';
import {buildSearchRequest} from './search-request';

export interface SearchAction {
  actionCause: string;
}

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
}

export interface PrepareForSearchWithQueryOptions {
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

export interface TransitiveSearchAction {
  legacy: LegacySearchAction;
  next?: SearchAction;
}

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveSearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (searchAction: TransitiveSearchAction, config) => {
    const state = config.getState();
    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !searchAction.next
    ) {
      return legacyExecuteSearch(state, config, searchAction.legacy);
    }
    addEntryInActionsHistory(state);
    const analyticsAction = buildSearchReduxAction(searchAction.next);

    const request = await buildSearchRequest(
      state,
      config.extra.navigatorContext,
      config.extra.relay,
      analyticsAction
    );

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction});

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
    config.extra.relay,
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
    SearchPageEvents.pagerScrolling,
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
    config.extra.relay,
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
    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !searchAction.next
    ) {
      return legacyExecuteSearch(state, config, searchAction.legacy);
    }
    const analyticsAction = buildSearchReduxAction(searchAction.next);

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction});

    const request = await buildFetchFacetValuesRequest(
      state,
      config.extra.navigatorContext,
      config.extra.relay,
      analyticsAction
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
      config.extra.relay,
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
  relay: Relay,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(
    state,
    navigatorContext,
    relay,
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

export const buildInstantResultSearchRequest = async (
  state: StateNeededByExecuteSearch,
  navigatorContext: NavigatorContext,
  relay: Relay,
  q: string,
  numberOfResults: number,
  eventDescription: EventDescription
) => {
  const sharedWithFoldingRequest =
    await buildSearchAndFoldingLoadCollectionRequest(
      state,
      navigatorContext,
      relay,
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
  relay: Relay,
  eventDescription?: EventDescription
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(
    state,
    navigatorContext,
    relay,
    eventDescription
  );
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

const buildSearchReduxAction = (action: SearchAction) => ({
  actionCause: action.actionCause,
  type: action.actionCause,
});
