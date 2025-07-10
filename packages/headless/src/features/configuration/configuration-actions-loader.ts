import type {PayloadAction} from '@reduxjs/toolkit';
import {configuration} from '../../app/common-reducers.js';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import {
  type AnalyticsRuntimeEnvironment,
  disableAnalytics,
  enableAnalytics,
  type SetOriginLevel2ActionCreatorPayload,
  type SetOriginLevel3ActionCreatorPayload,
  setOriginLevel2,
  setOriginLevel3,
  type UpdateAnalyticsConfigurationActionCreatorPayload,
  type UpdateBasicConfigurationActionCreatorPayload,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from './configuration-actions.js';

export type {
  SetOriginLevel2ActionCreatorPayload,
  SetOriginLevel3ActionCreatorPayload,
  UpdateAnalyticsConfigurationActionCreatorPayload,
  AnalyticsRuntimeEnvironment,
  UpdateBasicConfigurationActionCreatorPayload,
};

/**
 * The configuration action creators.
 *
 * @group Actions
 * @category Configuration
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
 *
 * @group Actions
 * @category Configuration
 */
export function loadConfigurationActions(
  engine: CoreEngine | CoreEngineNext
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
