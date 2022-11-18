import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededBySearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  logSearchEvent,
  LogSearchEventActionCreatorPayload,
  logClickEvent,
  LogClickEventActionCreatorPayload,
  logCustomEvent,
  LogCustomEventActionCreatorPayload,
} from './analytics-actions';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';

export type {
  LogSearchEventActionCreatorPayload,
  LogClickEventActionCreatorPayload,
  LogCustomEventActionCreatorPayload,
};

/**
 * The generic analytics action creators.
 */
export interface GenericAnalyticsActionCreators {
  /**
   * Creates a search analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logSearchEvent(payload: LogSearchEventActionCreatorPayload): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * Creates a click analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logClickEvent(payload: LogClickEventActionCreatorPayload): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;

  /**
   * Creates a custom analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCustomEvent(payload: LogCustomEventActionCreatorPayload): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededBySearchAnalyticsProvider>
  >;
}

/**
 * Returns possible generic analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadGenericAnalyticsActions(
  engine: SearchEngine
): GenericAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logSearchEvent,
    logClickEvent,
    logCustomEvent,
  };
}
