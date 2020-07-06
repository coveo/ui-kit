import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';

/**
 * Log a did you mean click
 */
export const logDidYouMeanClick = createAsyncThunk(
  'analytics/didyoumean',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logDidYouMeanClick();
    return makeSearchActionType();
  }
);

/**
 * Log a did you mean click
 */
export const logDidYouMeanAutomatic = createAsyncThunk(
  'analytics/didyoumean',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logDidYouMeanAutomatic();
    return makeSearchActionType();
  }
);
