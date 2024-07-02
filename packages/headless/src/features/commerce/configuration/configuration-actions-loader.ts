import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configurationReducer as configuration} from '../../configuration/configuration-slice';
import {
  UpdateAnalyticsConfigurationPayload,
  UpdateBasicConfigurationPayload,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from './configuration-actions';

export type {
  UpdateAnalyticsConfigurationPayload,
  UpdateBasicConfigurationPayload,
};

/**
 * The configuration action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ConfigurationActionCreators {
  /**
   * Disables analytics.
   *
   * @returns A dispatchable action.
   */
  disableAnalytics(): PayloadAction<void>;

  /**
   * Enables analytics.
   *
   * @returns A dispatchable action.
   */
  enableAnalytics(): PayloadAction<void>;

  /**
   * Updates the analytics configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAnalyticsConfiguration(
    payload: UpdateAnalyticsConfigurationPayload
  ): PayloadAction<UpdateAnalyticsConfigurationPayload>;

  /**
   * Updates the basic configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateBasicConfiguration(
    payload: UpdateBasicConfigurationPayload
  ): PayloadAction<UpdateBasicConfigurationPayload>;
}

/**
 * Loads the configuration reducer and returns the available configuration action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the configuration action creators.
 */
export function loadConfigurationActions(
  engine: CommerceEngine
): ConfigurationActionCreators {
  engine.addReducers({configuration});
  return {
    updateBasicConfiguration,
    updateAnalyticsConfiguration,
    disableAnalytics,
    enableAnalytics,
  };
}
