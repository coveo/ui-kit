import {createAsyncThunk} from '@reduxjs/toolkit';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import {
  isErrorResponse,
  type SearchOptions,
} from '../../api/search/search-api-client.js';
import type {
  AsyncThunkInsightOptions,
  InsightAPIClient,
} from '../../api/service/insight/insight-api-client.js';
import type {InsightQueryRequest} from '../../api/service/insight/query/query-request.js';
import type {
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
} from '../../state/state-sections.js';
import {requiredNonEmptyString} from '../../utils/validate-payload.js';
import type {InsightAction as LegacyInsightAction} from '../analytics/analytics-utils.js';
import {SearchPageEvents} from '../analytics/search-action-cause.js';
import type {
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
} from '../query-suggest/query-suggest-actions.js';
import type {
  ExecuteSearchThunkReturn,
  SearchAction,
} from '../search/search-actions.js';
import {
  type MappedSearchRequest,
  mapSearchResponse,
} from '../search/search-mappings.js';
import {buildInsightQuerySuggestRequest} from './insight-query-suggest-request.js';
import {
  AsyncInsightSearchThunkProcessor,
  type AsyncThunkConfig,
} from './insight-search-actions-thunk-processor.js';
import {
  buildInsightFetchFacetValuesRequest,
  buildInsightFetchMoreResultsRequest,
  buildInsightSearchRequest,
} from './insight-search-request.js';
import {
  legacyExecuteSearch,
  legacyFetchFacetValues,
  legacyFetchMoreResults,
  legacyFetchPage,
} from './legacy/insight-search-actions.js';

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
  const startedAt = Date.now();
  const response = mapSearchResponse(
    await client.query(request, options),
    mappings
  );
  const duration = Date.now() - startedAt;
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
    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyExecuteSearch(state, config, analyticsAction.legacy);
    }

    addEntryInActionsHistory(state);

    const processor = new AsyncInsightSearchThunkProcessor({
      ...config,
    });

    const eventDescription = analyticsAction.next
      ? buildEventDescription(analyticsAction.next)
      : undefined;

    const request = await buildInsightSearchRequest(state, eventDescription);
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

    if (state.configuration.analytics.analyticsMode === 'legacy') {
      return legacyFetchPage(state, config, analyticsAction.legacy);
    }

    addEntryInActionsHistory(state);

    const processor = new AsyncInsightSearchThunkProcessor({
      ...config,
    });

    const eventDescription = analyticsAction.next
      ? buildEventDescription(analyticsAction.next)
      : undefined;
    const request = await buildInsightSearchRequest(state, eventDescription);
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

  const eventDescription = buildEventDescription({
    actionCause: SearchPageEvents.browseResults,
  });

  const request = await buildInsightFetchMoreResultsRequest(
    state,
    eventDescription
  );
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

    if (state.configuration.analytics.analyticsMode === 'legacy') {
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
    HistoryStore.getInstance().addElement({
      name: 'Query',
      ...(state.query?.q && {
        value: state.query.q,
      }),
      time: JSON.stringify(new Date()),
    });
  }
};

const buildEventDescription = (action: SearchAction) => ({
  actionCause: action.actionCause,
  type: action.actionCause,
});
