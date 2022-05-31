import { createAsyncThunk } from "../..";
import { historyStore } from "../../api/analytics/analytics";
import { isErrorResponse } from "../../api/search/search-api-client";
import { AsyncThunkInsightOptions, InsightAPIClient } from "../../api/service/insight/insight-api-client";
import { InsightQueryRequest } from "../../api/service/insight/query/query-request";
import { InsightQueryResponse } from "../../api/service/insight/query/query-response";
import { ConfigurationSection, FacetSection, InsightCaseContextSection, InsightConfigurationSection, QuerySection } from "../../state/state-sections";
import { AnalyticsType, makeAnalyticsAction, SearchAction } from "../analytics/analytics-utils";
import { AnyFacetRequest } from "../facets/generic/interfaces/generic-facet-request";
import { snapshot } from "../history/history-actions";
import { extractHistory } from "../history/history-state";

export interface InsightExecuteSearchThunkReturn {
    /** The successful query response. */
    response: InsightQueryResponse;
    /** The number of milliseconds it took to receive the response. */
    duration: number;
    /** The query that was executed. */
    queryExecuted: string;
    /** Whether the query was automatically corrected. */
    automaticallyCorrected: boolean;
    /** The original query that was performed when an automatic correction is executed.*/
    originalQuery: string;
}

export type StateNeededByExecuteSearch = ConfigurationSection &
  InsightConfigurationSection &
  QuerySection &
  FacetSection &
  InsightCaseContextSection;

const fetchFromAPI = async (
    client: InsightAPIClient,
    state: StateNeededByExecuteSearch,
    request: InsightQueryRequest
  ) => {
    const startedAt = new Date().getTime();
    const response = await client.query(request);
    const duration = new Date().getTime() - startedAt;
    const queryExecuted = state.query?.q || '';
    return {response, duration, queryExecuted, requestExecuted: request};
};

export const insightExecuteSearch = createAsyncThunk<InsightExecuteSearchThunkReturn, SearchAction, AsyncThunkInsightOptions<StateNeededByExecuteSearch>>(
    'insight/search/executeSearch',
    async(analyticsAction: SearchAction,
        {getState, dispatch, rejectWithValue, extra}) => {
            const state = getState();
            addEntryInActionsHistory(state);
            const fetched = await fetchFromAPI(
                extra.apiClient,
                state,
                buildInsightSearchRequest(state)
            );
            if (isErrorResponse(fetched.response)) {
                return rejectWithValue(fetched.response.error);
            }
            
            dispatch(snapshot(extractHistory(getState())));

            return {
              response:fetched.response.success,
              automaticallyCorrected: false,
              originalQuery: getOriginalQuery(state),
              analyticsAction,
            };
        }
);
/** TODO: looking how to get from query more results */
export const insightFetchMoreResults = createAsyncThunk<InsightExecuteSearchThunkReturn, void, AsyncThunkInsightOptions<StateNeededByExecuteSearch>>(
  'insight/search/fetchMoreResults',
  async (_, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildInsightSearchRequest(state)
    );

    if (isErrorResponse(fetched.response)) {
      return rejectWithValue(fetched.response.error);
    }

    dispatch(snapshot(extractHistory(state)));

    return {
      ...fetched,
      response: fetched.response.success,
      automaticallyCorrected: false,
      originalQuery: getOriginalQuery(state),
      analyticsAction: logFetchMoreResults(),
    };
  }
);

export const insightFetchFacetValues = createAsyncThunk<InsightExecuteSearchThunkReturn, SearchAction, AsyncThunkInsightOptions<StateNeededByExecuteSearch>>(
  'insight/search/fetchFacetValues',
  async (analyticsAction: SearchAction, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();
    const fetched = await fetchFromAPI(
      apiClient,
      state,
      await buildInsightFetchFacetValuesRequest(state)
    );

    if (isErrorResponse(fetched.response)) {
      return rejectWithValue(fetched.response.error);
    }

    dispatch(snapshot(extractHistory(state)));

    return {
      ...fetched,
      response: fetched.response.success,
      automaticallyCorrected: false,
      originalQuery: getOriginalQuery(state),
      analyticsAction,
    };
  }
);

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

const buildInsightSearchRequest = (state: StateNeededByExecuteSearch): InsightQueryRequest => {
    return ({
        accessToken: state.configuration.accessToken,
        organizationId: state.configuration.organizationId,
        url: state.configuration.platformUrl,
        insightId: state.insightConfiguration.insightId,
        q: state.query.q,
        caseContext: state.insightCaseContext.caseContext
    });
}

const buildInsightFetchFacetValuesRequest = (state: StateNeededByExecuteSearch): InsightQueryRequest => {
    return ({
        accessToken: state.configuration.accessToken,
        organizationId: state.configuration.organizationId,
        url: state.configuration.platformUrl,
        insightId: state.insightConfiguration.insightId,
        facets: getFacetRequests(state.facetSet),
        caseContext: state.insightCaseContext.caseContext
    });
}
  
const getOriginalQuery = (state: StateNeededByExecuteSearch) =>
  state.query?.q !== undefined ? state.query.q : '';


export const logFetchMoreResults = makeAnalyticsAction(
    'search/logFetchMoreResults',
    AnalyticsType.Search,
    (client) => client.logFetchMoreResults()
);

function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}