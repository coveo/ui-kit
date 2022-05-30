import { createAsyncThunk } from "../..";
import { InsightAPIClient } from "../../api/service/insight/insight-api-client";
import { InsightQueryRequest } from "../../api/service/insight/query/query-request";
import { InsightQueryResponse } from "../../api/service/insight/query/query-response";
import { ConfigurationSection, InsightConfigurationSection } from "../../state/state-sections";
import { SearchAction } from "../analytics/analytics-utils";

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
  InsightConfigurationSection;

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
    async({insightId})
);