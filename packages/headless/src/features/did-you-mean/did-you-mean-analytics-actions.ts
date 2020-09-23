import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';

/**
 * Logs a did-you-mean click event, i.e., when a user clicks on a did-you-mean suggestion.
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
 * Logs a did-you-mean automatic event, i.e., when the interface automatically selects a did-you-mean suggestion.
 */
export const logDidYouMeanAutomatic = createAsyncThunk(
  'analytics/didyoumean',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logDidYouMeanAutomatic();
    return makeSearchActionType();
  }
);
