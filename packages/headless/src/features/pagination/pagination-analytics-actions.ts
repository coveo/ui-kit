import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';
import {currentPageSelector} from './pagination-selectors';

/**
 * Log pager resize
 */
export const logPagerResize = createAsyncThunk(
  'analytics/pager/resize',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logPagerResize({
      currentResultsPerPage: state.pagination.numberOfResults,
    });
    return makeSearchActionType();
  }
);

/**
 * Log page number
 */
export const logPageNumber = createAsyncThunk(
  'analytics/pager/number',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logPagerNumber({
      pagerNumber: currentPageSelector(state),
    });
    return makeSearchActionType();
  }
);

/**
 * Log pager next
 */
export const logPageNext = createAsyncThunk(
  'analytics/pager/next',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logPagerNext({
      pagerNumber: currentPageSelector(state),
    });
    return makeSearchActionType();
  }
);

/**
 * Log pager previous
 */
export const logPagePrevious = createAsyncThunk(
  'analytics/pager/previous',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logPagerPrevious({
      pagerNumber: currentPageSelector(state),
    });
    return makeSearchActionType();
  }
);
