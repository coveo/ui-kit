import {PayloadAction, AsyncThunkAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {configuration} from '../../app/reducers';
import {
  disableAnalytics,
  enableAnalytics,
  renewAccessToken,
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
   * Renews the accessToken specified in the global headless engine configuration.
   *
   * @param renew - A function that fetches a new access token. The function must return a Promise that resolves to a string (the new access token).
   * @returns A dispatchable action.
   * */
  renewAccessToken(
    renew: () => Promise<string>
  ): AsyncThunkAction<string, () => Promise<string>, {}>;

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
    renewAccessToken,
    setOriginLevel2,
    setOriginLevel3,
    updateAnalyticsConfiguration,
    updateBasicConfiguration,
  };
}
