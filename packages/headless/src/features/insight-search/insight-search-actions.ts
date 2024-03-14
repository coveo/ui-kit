import {createAsyncThunk} from '@reduxjs/toolkit';
import {historyStore} from '../../api/analytics/coveo-analytics-utils';
import {
  SearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  AsyncThunkInsightOptions,
  InsightAPIClient,
} from '../../api/service/insight/insight-api-client';
import {InsightQueryRequest} from '../../api/service/insight/query/query-request';
import {
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  DidYouMeanSection,
  FacetSection,
  FieldsSection,
  FoldingSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  NumericFacetSection,
  PaginationSection,
  QuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchSection,
  SortSection,
  TabSection,
} from '../../state/state-sections';
import {requiredNonEmptyString} from '../../utils/validate-payload';
import {InsightAction as LegacyInsightAction} from '../analytics/analytics-utils';
import {
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
} from '../query-suggest/query-suggest-actions';
import {ExecuteSearchThunkReturn, SearchAction} from '../search/search-actions';
import {
  MappedSearchRequest,
  mapSearchResponse,
} from '../search/search-mappings';
import {buildInsightQuerySuggestRequest} from './insight-query-suggest-request';
import {
  AsyncInsightSearchThunkProcessor,
  AsyncThunkConfig,
} from './insight-search-actions-thunk-processor';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from './insight-search-request';
import {
  legacyExecuteSearch,
  legacyFetchPage,
  legacyFetchFacetValues,
  legacyFetchMoreResults,
} from './legacy/insight-search-actions';

export type StateNeededByExecuteSearch = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    InsightCaseContextSection &
      SearchSection &
      QuerySection &
      FacetSection &
      NumericFacetSection &
      DateFacetSection &
      CategoryFacetSection &
      PaginationSection &
      TabSection &
      FieldsSection &
      DidYouMeanSection &
      SortSection &
      FoldingSection &
      ContextSection
  >;

export const fetchFromAPI = async (
  client: InsightAPIClient,
  state: StateNeededByExecuteSearch,
  {request, mappings}: MappedSearchRequest<InsightQueryRequest>,
  options?: SearchOptions
) => {
  const startedAt = new Date().getTime();
  const response = mapSearchResponse(
    await client.query(request, options),
    mappings
  );
  const duration = new Date().getTime() - startedAt;
  const queryExecuted = state.query?.q || '';
  return {
    response,
    duration,
    queryExecuted,
    requestExecuted: request,
  };
};

interface TransitiveInsightSearchAction {
  legacy: LegacyInsightAction;
  next?: SearchAction;
}

export const executeSearch = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/executeSearch',
  async (
    analyticsAction: TransitiveInsightSearchAction,
    config: AsyncThunkConfig
  ) => {
    const state = config.getState();
    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyExecuteSearch(state, config, analyticsAction.legacy);
    }

    addEntryInActionsHistory(state);

    const processor = new AsyncInsightSearchThunkProcessor({
      ...config,
    });

    const request = buildInsightSearchRequest(state);
    const fetched = await processor.fetchFromAPI(request);

    return await processor.process(fetched);
  }
);

export const fetchPage = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchPage',
  async (
    analyticsAction: TransitiveInsightSearchAction,
    config: AsyncThunkConfig
  ) => {
    const state = config.getState();

    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyFetchPage(state, config, analyticsAction.legacy);
    }

    addEntryInActionsHistory(state);

    const processor = new AsyncInsightSearchThunkProcessor({
      ...config,
    });

    const request = buildInsightSearchRequest(state);
    const fetched = await processor.fetchFromAPI(request);

    return await processor.process(fetched);
  }
);

export const fetchMoreResults = createAsyncThunk<
  ExecuteSearchThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>('search/fetchMoreResults', async (_, config: AsyncThunkConfig) => {
  const state = config.getState();

  if (state.configuration.analytics.analyticsMode === 'legacy') {
    return legacyFetchMoreResults(state, config);
  }

  const processor = new AsyncInsightSearchThunkProcessor({
    ...config,
  });

  const request = await buildInsightFetchMoreResultsRequest(state);
  const fetched = await processor.fetchFromAPI(request);

  return await processor.process(fetched);
});

export const fetchFacetValues = createAsyncThunk<
  ExecuteSearchThunkReturn,
  TransitiveInsightSearchAction,
  AsyncThunkInsightOptions<StateNeededByExecuteSearch>
>(
  'search/fetchFacetValues',
  async (
    analyticsAction: TransitiveInsightSearchAction,
    config: AsyncThunkConfig
  ) => {
    const state = config.getState();

    if (
      state.configuration.analytics.analyticsMode === 'legacy' ||
      !analyticsAction.next
    ) {
      return legacyFetchFacetValues(state, config, analyticsAction.legacy);
    }

    const processor = new AsyncInsightSearchThunkProcessor({
      ...config,
    });

    const request = await buildInsightFetchFacetValuesRequest(state);
    const fetched = await processor.fetchFromAPI(request);

    return await processor.process(fetched);
  }
);

export type StateNeededByQuerySuggest = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    ConfigurationSection &
      QuerySuggestionSection &
      QuerySetSection &
      InsightCaseContextSection
  >;

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkInsightOptions<StateNeededByQuerySuggest>
>(
  'querySuggest/fetch',
  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const id = payload.id;
    const request = await buildInsightQuerySuggestRequest(id, getState());
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id,
      q: request.q,
      ...response.success,
    };
  }
);

export const addEntryInActionsHistory = (state: StateNeededByExecuteSearch) => {
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
