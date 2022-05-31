import { InsightAPIErrorStatusResponse } from "../../api/service/insight/insight-api-client";
import { InsightQueryResponse } from "../../api/service/insight/query/query-response";

export const getInsightSearchInitialState = (): InsightSearchState => ({
    loading: false,
    error:undefined,
    response: undefined,
    duration: 0,
    queryExecuted: ''
});

export interface InsightSearchState {
    loading: boolean;
    error?: InsightAPIErrorStatusResponse;
    response: InsightQueryResponse;
    queryExecuted : string;
    duration : number;
}

export const getInsightCaseContextSearchInitialState = (): InsightCaseContextState => ({
    caseContext: null
})

export interface InsightCaseContextState {
    caseContext: Record<string, string>;
}