import { createReducer } from "../..";
import { insightExecuteSearch } from "./insight-search-actions";
import { getInsightSearchInitialState } from "./insight-search-state";

export const insightInterfaceReducer = createReducer(getInsightSearchInitialState(), (builder) => {
    builder.addCase(insightExecuteSearch.pending, (state) => {
        state.loading = true;
    })
    .addCase(insightExecuteSearch.rejected, (state) => {
        state.loading = true;
    })
    .addCase(insightExecuteSearch.fulfilled, (state, action) => {
        state.loading = false;
        
    })
})