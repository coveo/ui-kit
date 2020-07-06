import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';

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

    return makeSearchActionType();
  }
);
