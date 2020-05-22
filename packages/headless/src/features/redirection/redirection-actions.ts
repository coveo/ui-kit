import {createAsyncThunk} from '@reduxjs/toolkit';
import {getExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {HeadlessState} from '../../state';

/**
 * Preprocess the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 */
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
