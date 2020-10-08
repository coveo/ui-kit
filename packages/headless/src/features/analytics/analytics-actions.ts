import {createAsyncThunk, AsyncThunkAction} from '@reduxjs/toolkit';
import {configureAnalytics} from '../../api/analytics/analytics';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {SearchPageState} from '../../state';

export const searchPageState = (getState: () => unknown) =>
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

export const makeSearchActionType = () => ({
  analyticsType: AnalyticsType.Search as AnalyticsType.Search,
});

export const makeClickActionType = () => ({
  analyticsType: AnalyticsType.Click as AnalyticsType.Click,
});

export interface GenericSearchEventPayload {
  /** The identifier of the search action (e.g., `interfaceLoad`). */
  evt: SearchPageEvents | string;
  /** The event metadata. */
  meta?: Record<string, any>;
}

/**
 * Logs a generic search event.
 * @param p (GenericSearchEventPayload) The search event payload.
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

/**
 * Logs an interface load event.
 */
export const logInterfaceLoad = createAsyncThunk(
  'analytics/interface/load',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logInterfaceLoad();
    return makeSearchActionType();
  }
);

/**
 * Logs an interface change event.
 */
export const logInterfaceChange = createAsyncThunk(
  'analytics/interface/change',
  async (_, {getState}) => {
    const state = searchPageState(getState);
    await configureAnalytics(state).logInterfaceChange({
      interfaceChangeTo: state.constantQuery.cq,
    });
    return makeSearchActionType();
  }
);
