/**
 * Configuration Feature Selectors
 *
 * Provides library-agnostic selectors for reading configuration state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {configurationSlice} from '@/src/core/internal/configuration/slice.js';
import {ConfigurationState} from './types.js';

type StateWithConfigurationSlice = {configuration: ConfigurationState};

export const organizationId = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.organizationId(state);
};
export const accessToken = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.accessToken(state);
};
export const endpoint = (state: StateWithConfigurationSlice) => {
  return configurationSlice.selectors.endpoint(state);
};
