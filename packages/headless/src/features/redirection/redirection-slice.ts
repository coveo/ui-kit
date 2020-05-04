import {createAsyncThunk, createReducer} from '@reduxjs/toolkit';
import {HeadlessState, RedirectionState} from '@coveo/headless';
import {getExecutionPlan} from '../../api/search/plan/plan-endpoint';

export const checkForRedirection = createAsyncThunk(
  'redirection/check',
  async (_, {getState}) => {
    const executionPlan = await getExecutionPlan(getState() as HeadlessState);
    if (executionPlan.redirectionURL) {
      // Dispatch redirection trigger analytics here
    }

    return executionPlan.redirectionURL;
  }
);

export const getRedirectionInitialState: () => RedirectionState = () => ({
  redirectTo: null,
});

export const redirectionReducer = createReducer(
  getRedirectionInitialState(),
  builder =>
    builder.addCase(checkForRedirection.fulfilled, (state, action) => {
      state.redirectTo = action.payload;
    })
);
