/**
 * Configuration Feature Selectors
 *
 * Provides library-agnostic selectors for reading configuration state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import {ConfigurationState} from './configuration-types.js';

type StateWithConfigurationSlice = {configuration: ConfigurationState};

export const organizationId = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.organizationId(state);
};
export const accessToken = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.accessToken(state);
};
export const trackingId = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.trackingId(state);
};
export const language = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.language(state);
};
export const country = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.country(state);
};
export const currency = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.currency(state);
};
export const endpoint = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.endpoint(state);
};
