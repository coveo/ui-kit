import {createReducer} from '@reduxjs/toolkit';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
} from './configuration-actions';
import {ConfigurationState} from '../../state';

export const getConfigurationInitialState: () => ConfigurationState = () => ({
  organizationId: '',
  accessToken: '',
  search: {
    searchApiBaseUrl: 'https://globalplatform.cloud.coveo.com/rest/search',
  },
  analyticsEnabled: true,
});

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.organizationId = action.payload.organizationId;
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        if (action.payload.searchApiBaseUrl) {
          state.search.searchApiBaseUrl = action.payload.searchApiBaseUrl;
        }
      })
      .addCase(renewAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(disableAnalytics, (state) => {
        state.analyticsEnabled = false;
      })
      .addCase(enableAnalytics, (state) => {
        state.analyticsEnabled = true;
      })
);
