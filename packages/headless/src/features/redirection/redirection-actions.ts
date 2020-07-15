import {createAsyncThunk} from '@reduxjs/toolkit';
import {getExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {SearchPageState} from '../../state';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';

/**
 * Preprocess the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 */
export const checkForRedirection = createAsyncThunk<
  string | null,
  void,
  {
    rejectValue: SearchAPIErrorWithStatusCode;
  }
>('redirection/check', async (_, {getState, rejectWithValue}) => {
  try {
    const plan = await getExecutionPlan(getState() as SearchPageState);
    return plan.redirectionURL;
  } catch (e) {
    return rejectWithValue(e);
  }
});
