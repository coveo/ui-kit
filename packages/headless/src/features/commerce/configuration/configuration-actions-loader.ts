import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {configurationReducer as configuration} from '../../configuration/configuration-slice.js';
import {
  disableAnalytics,
  enableAnalytics,
  type UpdateAnalyticsConfigurationPayload,
  type UpdateBasicConfigurationPayload,
  type UpdateProxyBaseUrlPayload,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
  updateProxyBaseUrl,
} from './configuration-actions.js';

export type {
  UpdateAnalyticsConfigurationPayload,
  UpdateBasicConfigurationPayload,
};

/**
 * The configuration action creators.
 *
 * @group Actions
 * @category Configuration
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

  /**
   * Updates the commerce configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateProxyBaseUrl(
    payload: UpdateProxyBaseUrlPayload
  ): PayloadAction<UpdateProxyBaseUrlPayload>;
}

/**
 * Loads the configuration reducer and returns the available commerce configuration action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the commerce configuration action creators.
 *
 * @group Actions
 * @category Configuration
 */
export function loadConfigurationActions(
  engine: CommerceEngine
): ConfigurationActionCreators {
  engine.addReducers({configuration});
  return {
    disableAnalytics,
    enableAnalytics,
    updateAnalyticsConfiguration,
    updateBasicConfiguration,
    updateProxyBaseUrl,
  };
}
