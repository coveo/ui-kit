import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {configuration} from '../../app/reducers';
import {
  disableAnalytics,
  enableAnalytics,
  setOriginLevel2,
  SetOriginLevel2ActionCreatorPayload,
  setOriginLevel3,
  SetOriginLevel3ActionCreatorPayload,
  updateAnalyticsConfiguration,
  UpdateAnalyticsConfigurationActionCreatorPayload,
  updateBasicConfiguration,
  UpdateBasicConfigurationActionCreatorPayload,
  AnalyticsRuntimeEnvironment,
} from './configuration-actions';

export {
  SetOriginLevel2ActionCreatorPayload,
  SetOriginLevel3ActionCreatorPayload,
  UpdateAnalyticsConfigurationActionCreatorPayload,
  AnalyticsRuntimeEnvironment,
  UpdateBasicConfigurationActionCreatorPayload,
};

/**
 * The configuration action creators.
 */
export interface ConfigurationActionCreators {
  /**
   * Disables analytics tracking.
   *
   * @returns A dispatchable action.
   */
  disableAnalytics(): PayloadAction;

  /**
   * Enables analytics tracking.
   *
   * @returns A dispatchable action.
   */
  enableAnalytics(): PayloadAction;

  /**
   * Sets originLevel2 for analytics tracking.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setOriginLevel2(
    payload: SetOriginLevel2ActionCreatorPayload
  ): PayloadAction<SetOriginLevel2ActionCreatorPayload>;

  /**
   * Sets originLevel3 for analytics tracking.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  setOriginLevel3(
    payload: SetOriginLevel3ActionCreatorPayload
  ): PayloadAction<SetOriginLevel3ActionCreatorPayload>;

  /**
   * Updates the analytics configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  updateAnalyticsConfiguration(
    payload: UpdateAnalyticsConfigurationActionCreatorPayload
  ): PayloadAction<UpdateAnalyticsConfigurationActionCreatorPayload>;

  /**
   * Updates the global headless engine configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   * */
  updateBasicConfiguration(
    payload: UpdateBasicConfigurationActionCreatorPayload
  ): PayloadAction<UpdateBasicConfigurationActionCreatorPayload>;
}

/**
 * Loads the `configuration` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadConfigurationActions(
  engine: CoreEngine
): ConfigurationActionCreators {
  engine.addReducers({configuration});

  return {
    disableAnalytics,
    enableAnalytics,
    setOriginLevel2,
    setOriginLevel3,
    updateAnalyticsConfiguration,
    updateBasicConfiguration,
  };
}
