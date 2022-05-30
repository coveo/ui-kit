import { SearchState } from "../search/search-state";

export const getInsightSearchInitialState = (): InsightSearchState => ({
    loading: false,
    searchState: undefined,
    error: null
});

export interface InsightSearchState {
    loading: boolean;
    searchState: SearchState;
    error: Error;
}