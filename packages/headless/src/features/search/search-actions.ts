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
import {
  SearchAction as LegacySearchAction,
  makeBasicNewSearchAnalyticsAction,
} from '../analytics/analytics-utils';
import {SearchPageEvents} from '../analytics/search-action-cause';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../facets/generic/facet-actions';
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
  AnalyticsAction,
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor';
import {MappedSearchRequest, mapSearchRequest} from './search-mappings';
import {buildSearchRequest} from './search-request';

export interface SearchAction<
  State extends StateNeededByExecuteSearch = StateNeededByExecuteSearch,
  Payload extends Object = {},
> {
  actionCause: string;
  getEventExtraPayload: (state: State) => Payload;
}

type SingleOrArray<T> = T | T[];

export const buildSearchAction = <
  State extends StateNeededByExecuteSearch = StateNeededByExecuteSearch,
  Payload extends Object = {},
>(
  actionCause: string,
  getEventExtraPayload: SingleOrArray<
    ({
      state,
      payload,
    }: {
      state: StateNeededByExecuteSearch;
      payload: Partial<Payload>;
    }) => void
  >
) => {
  const getEventExtraPayloadFunctionArray = Array.isArray(getEventExtraPayload)
    ? getEventExtraPayload
    : [getEventExtraPayload];
  const combinedGetEventExtraPayload = (state: State) => {
    const payload = {};
    for (const payloadTransformer of getEventExtraPayloadFunctionArray) {
      payloadTransformer({state, payload});
    }
    return payload;
  };
  return {
    actionCause,
    getEventExtraPayload: combinedGetEventExtraPayload,
  };
};

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
  analyticsAction: AnalyticsAction;
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
    const analyticsAction = buildSearchReduxAction(searchAction.next, state);

    const request = await buildSearchRequest(state, analyticsAction);

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

  const request = await buildSearchRequest(state, searchAction.next);
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

  const request = await buildFetchMoreRequest(state, analyticsAction);
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
    const analyticsAction = buildSearchReduxAction(searchAction.next, state);

    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction});

    const request = await buildFetchFacetValuesRequest(state, analyticsAction);
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
    const analyticsAction = makeBasicNewSearchAnalyticsAction(
      SearchPageEvents.searchboxAsYouType,
      config.getState
    );
    const processor = new AsyncSearchThunkProcessor<
      ReturnType<typeof config.rejectWithValue>
    >({...config, analyticsAction}, (modification) => {
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

const buildSearchReduxAction = (
  action: SearchAction,
  state: StateNeededByExecuteSearch
) => ({
  customData: action.getEventExtraPayload(state),
  actionCause: action.actionCause,
  type: action.actionCause,
});
