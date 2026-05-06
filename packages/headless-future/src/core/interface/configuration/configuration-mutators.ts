/**
 * Configuration Feature Mutations
 *
 * Provides library-agnostic mutation API for configuration state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the configuration slice is not loaded, mutations will have no effect.
 */

import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {ConfigurationState} from './configuration-types.js';

/**
 * Configuration mutations
 */
export const setOrganizationId = (organizationId: string): StateMutation => {
  return configurationSlice.actions.setOrganizationId(organizationId);
};

export const setAccessToken = (accessToken: string): StateMutation => {
  return configurationSlice.actions.setAccessToken(accessToken);
};

export const setTrackingId = (trackingId: string): StateMutation => {
  return configurationSlice.actions.setTrackingId(trackingId);
};

export const setLanguage = (language: string): StateMutation => {
  return configurationSlice.actions.setLanguage(language);
};

export const setCountry = (country: string): StateMutation => {
  return configurationSlice.actions.setCountry(country);
};

export const setCurrency = (currency: string): StateMutation => {
  return configurationSlice.actions.setCurrency(currency);
};

export const setEndpoint = (endpoint: string | undefined): StateMutation => {
  return configurationSlice.actions.setEndpoint(endpoint);
};

export const setConfiguration = (config: ConfigurationState): StateMutation => {
  return configurationSlice.actions.setConfiguration(config);
};
