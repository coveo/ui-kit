import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageState} from '../../state';
import {configureAnalytics} from '../../api/analytics/analytics';

const searchPageState = (getState: () => unknown) =>
  getState() as SearchPageState;

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
  }
);

/**
 * Log searchbox submit
 */
export const logSearchboxSubmit = createAsyncThunk(
  'analytics/searchbox/submit',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchboxSubmit();
  }
);

/**
 * Log results sort
 */
export const logResultsSort = createAsyncThunk(
  'analytics/sort/results',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logResultsSort({
      resultsSortBy: state.sortCriteria,
    });
  }
);
