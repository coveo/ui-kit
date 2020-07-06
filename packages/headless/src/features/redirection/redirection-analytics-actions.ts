import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';

/**
 * Log trigger redirection
 */
export const logTriggerRedirect = createAsyncThunk(
  'analytics/trigger/redirection',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    if (state.redirection.redirectTo !== null) {
      await configureAnalytics(state).logTriggerRedirect({
        redirectedTo: state.redirection.redirectTo,
      });
    }
    return makeSearchActionType();
  }
);
