import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';

/**
 * Log searchbox submit
 */
export const logSearchboxSubmit = createAsyncThunk(
  'analytics/searchbox/submit',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchboxSubmit();
    return makeSearchActionType();
  }
);
