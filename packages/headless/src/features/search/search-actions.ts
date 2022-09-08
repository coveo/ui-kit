import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {SearchResponseSuccess} from '../../api/search/search/search-response';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../query/query-actions';
import {InstantResultSection} from '../../state/state-sections';
import {historyStore} from '../../api/analytics/search-analytics';

import {SearchAction} from '../analytics/analytics-utils';

import {logFetchMoreResults} from './search-analytics-actions';
import {MappedSearchRequest, mapSearchRequest} from './search-mappings';
import {BooleanValue, NumberValue, StringValue} from '@coveo/bueno';
import {updatePage} from '../pagination/pagination-actions';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {buildSearchRequest} from './search-request';
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
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';

export type {StateNeededByExecuteSearch} from './search-actions-thunk-processor';
import {
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor';
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
>('search/executeSearch', async (analyticsAction: SearchAction, config) => {
  const state = config.getState();
  addEntryInActionsHistory(state);

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction});

  const request = await buildSearchRequest(state);
  const fetched = await processor.fetchFromAPI(request, 'mainSearch');

  return await processor.process(fetched);
});

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchPage', async (analyticsAction: SearchAction, config) => {
  const state = config.getState();
  addEntryInActionsHistory(state);

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction,
  });

  const request = await buildSearchRequest(state);
  const fetched = await processor.fetchFromAPI(request, 'mainSearch');

  return await processor.process(fetched);
});

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config) => {
  const state = config.getState();

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({
    ...config,
    analyticsAction: logFetchMoreResults(),
  });

  const request = await buildFetchMoreRequest(state);
  const fetched = await processor.fetchFromAPI(request, 'mainSearch');

  return await processor.process(fetched);
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  SearchAction,
  AsyncThunkSearchOptions<StateNeededByExecuteSearch>
>('search/fetchFacetValues', async (analyticsAction: SearchAction, config) => {
  const state = config.getState();

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >({...config, analyticsAction});

  const request = await buildFetchFacetValuesRequest(state);
  const fetched = await processor.fetchFromAPI(request, 'facetValues');

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
    >({...config, analyticsAction: null}, (modification) =>
      config.dispatch(
        updateInstantResultsQuery({q: modification, id: payload.id})
      )
    );

    const request = await buildInstantResultSearchRequest(
      state,
      q,
      maxResultsPerQuery
    );

    const fetched = await processor.fetchFromAPI(request, 'instantResults');
    const processed = await processor.process(fetched);
    if ('response' in processed) {
      return {
        results: processed.response.results,
      };
    }
    return processed as ReturnType<typeof config.rejectWithValue>;
  }
);

const buildFetchMoreRequest = async (
  state: StateNeededByExecuteSearch
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state);
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
  state: StateNeededByExecuteSearch
): Promise<MappedSearchRequest> => {
  const mappedRequest = await buildSearchRequest(state);
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
