import {createAsyncThunk, createReducer, createAction} from '@reduxjs/toolkit';
import {HeadlessState, QuerySuggestState} from '../../state';
import {getQuerySuggestions} from '../../api/search/query-suggest/query-suggest-endpoint';

export const updateQuerySuggestCount = createAction<{count: number}>(
  'querySuggest/updateCount'
);

export const fetchQuerySuggestions = createAsyncThunk(
  'querySuggest/fetch',
  async (options: {count: number}, {getState, dispatch}) => {
    dispatch(updateQuerySuggestCount({count: options.count}));

    return await getQuerySuggestions(getState() as HeadlessState);
  }
);

export const getQuerySuggestInitialState: () => QuerySuggestState = () => ({
  completions: [],
  count: 5,
});

export const querySuggestReducer = createReducer(
  getQuerySuggestInitialState(),
  builder =>
    builder
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        state.completions = action.payload.completions;
      })
      .addCase(updateQuerySuggestCount, (state, action) => {
        state.count = action.payload.count;
      })
);
