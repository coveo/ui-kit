import { createReducer } from "../..";
import { insightExecuteSearch } from "./insight-search-actions";
import { getInsightSearchInitialState } from "./insight-search-state";

export const insightInterfaceReducer = createReducer(getInsightSearchInitialState(), (builder) => {
    builder.addCase(insightExecuteSearch.pending, (state) => {
        state.loading = true;
    })
    .addCase(insightExecuteSearch.rejected, (state, action) => {
        state.loading = true;
        state.error = action.payload;
    })
    .addCase(insightExecuteSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.duration = action.payload.duration;
        state.response = action.payload.response;
        state.queryExecuted = action.payload.queryExecuted;
    })
})