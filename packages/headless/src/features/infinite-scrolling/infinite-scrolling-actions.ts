import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {configureAnalytics} from '../../api/analytics/analytics';
import {
  makeSearchActionType,
  searchPageState,
} from '../analytics/analytics-actions';

export const enableInfiniteScrolling = createAction(
  'infinite-scrolling/enable'
);

export const disableInfiniteScrolling = createAction(
  'infinite-scrolling/disable'
);

export const logFetchMoreResults = createAsyncThunk(
  'infinite-scrolling/fetchMoreResults/log',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(
      state
    ).logSearchEvent('execute' as SearchPageEvents, {fetchMoreResults: true});
    return makeSearchActionType();
  }
);
