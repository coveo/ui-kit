/**
 * Configuration Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the configuration feature.
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';

/**
 * Initial configuration state
 */
export const initialConfigurationState: ConfigurationState = {
  organizationId: '',
  accessToken: '',
  trackingId: '',
  language: '',
  country: '',
  currency: '',
  endpoint: undefined,
};

/**
 * Configuration slice manages API credentials and settings
 */
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
