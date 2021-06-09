import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {Engine} from '../../app/headless-engine';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';
import {
  logSearchEvent,
  LogSearchEventActionCreatorPayload,
  logClickEvent,
  LogClickEventActionCreatorPayload,
  logCustomEvent,
  LogCustomEventActionCreatorPayload,
} from './analytics-actions';

export {
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
  logSearchEvent(
    payload: LogSearchEventActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Search;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * Creates a click analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logClickEvent(
    payload: LogSearchEventActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Click;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;

  /**
   * Creates a custom analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCustomEvent(
    payload: LogCustomEventActionCreatorPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;
}

/**
 * Returns possible generic analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadGenericAnalyticsActions(
  engine: Engine<object>
): GenericAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logSearchEvent,
    logClickEvent,
    logCustomEvent,
  };
}
