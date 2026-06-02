import {createSlice} from '@reduxjs/toolkit';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';
import * as configurationActions from './configuration-actions.js';

export const initialConfigurationState: ConfigurationState = {
  organizationId: '',
  accessToken: '',
  trackingId: '',
  language: '',
  country: '',
  currency: '',
  endpoint: undefined,
};

export const configurationSlice = createSlice({
  name: 'configuration',
  initialState: initialConfigurationState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(configurationActions.setOrganizationId, (state, action) => {
      state.organizationId = action.payload;
    });
    builder.addCase(configurationActions.setAccessToken, (state, action) => {
      state.accessToken = action.payload;
    });
    builder.addCase(configurationActions.setTrackingId, (state, action) => {
      state.trackingId = action.payload;
    });
    builder.addCase(configurationActions.setLanguage, (state, action) => {
      state.language = action.payload;
    });
    builder.addCase(configurationActions.setCountry, (state, action) => {
      state.country = action.payload;
    });
    builder.addCase(configurationActions.setCurrency, (state, action) => {
      state.currency = action.payload;
    });
    builder.addCase(configurationActions.setEndpoint, (state, action) => {
      state.endpoint = action.payload;
    });
    builder.addCase(configurationActions.setConfiguration, (_state, action) => {
      return action.payload;
    });
  },
  selectors: {
    organizationId: (state) => state.organizationId,
    accessToken: (state) => state.accessToken,
    trackingId: (state) => state.trackingId,
    language: (state) => state.language,
    country: (state) => state.country,
    currency: (state) => state.currency,
    endpoint: (state) => state.endpoint,
  },
});
