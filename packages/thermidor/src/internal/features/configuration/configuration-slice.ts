import {createSlice} from '@reduxjs/toolkit';
import type {ConfigurationState} from './configuration-types.js';
import {
  setOrganizationId,
  setAccessToken,
  setTrackingId,
  setLanguage,
  setCountry,
  setCurrency,
  setEndpoint,
  setConfiguration,
} from './configuration-actions.js';

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
    builder.addCase(setOrganizationId, (state, action) => {
      state.organizationId = action.payload;
    });
    builder.addCase(setAccessToken, (state, action) => {
      state.accessToken = action.payload;
    });
    builder.addCase(setTrackingId, (state, action) => {
      state.trackingId = action.payload;
    });
    builder.addCase(setLanguage, (state, action) => {
      state.language = action.payload;
    });
    builder.addCase(setCountry, (state, action) => {
      state.country = action.payload;
    });
    builder.addCase(setCurrency, (state, action) => {
      state.currency = action.payload;
    });
    builder.addCase(setEndpoint, (state, action) => {
      state.endpoint = action.payload;
    });
    builder.addCase(setConfiguration, (_state, action) => {
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
