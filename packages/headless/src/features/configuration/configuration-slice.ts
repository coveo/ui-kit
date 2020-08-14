import {createReducer} from '@reduxjs/toolkit';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel2,
  setOriginLevel3,
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
    /**
     * Origin level 2 is a usage analytics event metadata whose value should typically be the name/identifier of the tab from which the usage analytics event originates.
     *
     * When logging a Search usage analytics event, originLevel2 should always be set to the same value as the corresponding tab (parameter) Search API query parameter so Coveo Machine Learning models function properly, and usage analytics reports and dashboards are coherent.
     *
     * This value is optional, and will automatically try to resolve itself from the tab search parameter.
     */
    originLevel2: string;

    /**
     * Origin level 3 is a usage analytics event metadata whose value should typically be the URL of the page that linked to the search interface that’s making the request.
     *
     * When logging a Search usage analytics event, originLevel3 should always be set to the same value as the corresponding referrer Search API query parameter so usage analytics reports and dashboards are coherent.
     *
     * This value is optional, and will automatically try to resolve itself from the referrer search parameter.
     */
    originLevel3: string;
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
    originLevel2: 'default',
    originLevel3: 'default',
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
        if (action.payload.enabled !== undefined) {
          state.analytics.enabled = action.payload.enabled;
        }
        if (action.payload.originLevel2 !== undefined) {
          state.analytics.originLevel2 = action.payload.originLevel2;
        }
        if (action.payload.originLevel3 !== undefined) {
          state.analytics.originLevel3 = action.payload.originLevel3;
        }
        if (action.payload.apiBaseUrl !== undefined) {
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
      .addCase(setOriginLevel2, (state, action) => {
        state.analytics.originLevel2 = action.payload.originLevel2;
      })
      .addCase(setOriginLevel3, (state, action) => {
        state.analytics.originLevel3 = action.payload.originLevel3;
      })
);
