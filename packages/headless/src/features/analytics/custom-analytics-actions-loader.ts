import {AsyncThunkAction} from '@reduxjs/toolkit';
import {StateNeededByAnalyticsProvider} from '../../api/analytics/analytics';
import {Engine} from '../../app/headless-engine';
import {AnalyticsType, AsyncThunkAnalyticsOptions} from './analytics-utils';
import {logCustomEvent, CustomEventPayload} from './analytics-actions';

export {CustomEventPayload};

/**
 * The custom analytics action creators.
 */
export interface CustomAnalyticsActionCreators {
  /**
   * Creates a custom analytics event.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  logCustomEvent(
    payload: CustomEventPayload
  ): AsyncThunkAction<
    {
      analyticsType: AnalyticsType.Custom;
    },
    void,
    AsyncThunkAnalyticsOptions<StateNeededByAnalyticsProvider>
  >;
}

/**
 * Returns possible custom analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCustomAnalyticsActions(
  engine: Engine<object>
): CustomAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logCustomEvent,
  };
}
