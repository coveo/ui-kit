import {createAsyncThunk, AsyncThunkAction} from '@reduxjs/toolkit';
import {configureAnalytics} from '../../api/analytics/analytics';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchPageState} from '../../state';
import {currentPageSelector} from '../pagination/pagination-selectors';

const searchPageState = (getState: () => unknown) =>
  getState() as SearchPageState;

export enum AnalyticsType {
  Search,
  Custom,
  Click,
}

export type SearchAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Search},
  void | {},
  {}
>;

export type CustomAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Custom},
  {},
  {}
>;

export type ClickAction = AsyncThunkAction<
  {analyticsType: AnalyticsType.Click},
  {},
  {}
>;

const makeSearchActionType = () => ({
  analyticsType: AnalyticsType.Search as AnalyticsType.Search,
});
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

export interface GenericSearchEventPayload {
  evt: SearchPageEvents | string;
  meta?: Record<string, any>;
}

/**
 * Log generic search event
 */
export const logGenericSearchEvent = createAsyncThunk(
  'analytics/generic/search',
  async (p: GenericSearchEventPayload, {getState}) => {
    //TODO: Validate payload
    const {evt, meta} = p;
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchEvent(
      evt as SearchPageEvents,
      meta
    );
    return makeSearchActionType();
  }
);
