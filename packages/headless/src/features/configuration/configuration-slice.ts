import {createReducer} from '@reduxjs/toolkit';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
} from './configuration-actions';
import {platformUrl} from '../../api/platform-client';

export interface ConfigurationState {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  /**
   * The Plaform URL to use.
   * By default, https://platform.cloud.coveo.com
   */
  platformUrl: string;
  /**
   * The global headless engine Search API configuration.
   */
  search: {
    /**
     * The Search API base URL to use.
     * By default, will append /rest/search/v2 to the platformUrl value.
     */
    apiBaseUrl: string;
  };
  /**
   * The global headless engine Usage Analytics API configuration.
   */
  analytics: {
    /**
     * Specifies if analytics tracking should be enabled. By default analytics events are tracked.
     */
    enabled: boolean;
    /**
     * The Analytics API base URL to use.
     * By default, will append /rest/ua to the platformUrl value.
     */
    apiBaseUrl: string;
  };
}

const searchAPIEndpoint = '/rest/search/v2';
const analyticsAPIEndpoint = '/rest/ua';

export const getConfigurationInitialState: () => ConfigurationState = () => ({
  organizationId: '',
  accessToken: '',
  platformUrl: platformUrl(),
  search: {
    apiBaseUrl: `${platformUrl()}${searchAPIEndpoint}`,
  },
  analytics: {
    enabled: true,
    apiBaseUrl: `${platformUrl()}${analyticsAPIEndpoint}`,
  },
});

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.organizationId = action.payload.organizationId;
        if (action.payload.platformUrl) {
          state.platformUrl = action.payload.platformUrl;
          state.search.apiBaseUrl = `${action.payload.platformUrl}${searchAPIEndpoint}`;
          state.analytics.apiBaseUrl = `${action.payload.platformUrl}${analyticsAPIEndpoint}`;
        }
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        if (action.payload.apiBaseUrl) {
          state.search.apiBaseUrl = action.payload.apiBaseUrl;
        }
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        if (action.payload.apiBaseUrl) {
          state.analytics.apiBaseUrl = action.payload.apiBaseUrl;
        }
      })
      .addCase(renewAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(disableAnalytics, (state) => {
        state.analytics.enabled = false;
      })
      .addCase(enableAnalytics, (state) => {
        state.analytics.enabled = true;
      })
);
