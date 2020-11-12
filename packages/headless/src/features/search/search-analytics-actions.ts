import {createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {configureAnalytics} from '../../api/analytics/analytics';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';

export const logFetchMoreResults = createAsyncThunk(
  'search/logFetchMoreResults',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchEvent(
      'pagerScrolling' as SearchPageEvents,
      {
        type: 'getMoreResults',
      }
    );
    return makeSearchActionType();
  }
);
