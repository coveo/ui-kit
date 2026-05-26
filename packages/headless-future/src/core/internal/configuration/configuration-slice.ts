import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';

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
  reducers: {
    setOrganizationId: (state, action: PayloadAction<string>) => {
      state.organizationId = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setTrackingId: (state, action: PayloadAction<string>) => {
      state.trackingId = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCountry: (state, action: PayloadAction<string>) => {
      state.country = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setEndpoint: (state, action: PayloadAction<string | undefined>) => {
      state.endpoint = action.payload;
    },
    setConfiguration: (_state, action: PayloadAction<ConfigurationState>) => {
      return action.payload;
    },
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
