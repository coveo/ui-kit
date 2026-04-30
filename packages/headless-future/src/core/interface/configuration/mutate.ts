/**
 * Configuration Feature Mutations
 *
 * Provides library-agnostic mutation API for configuration state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the configuration slice is not loaded, mutations will have no effect.
 */

import {configurationSlice} from '@/src/core/internal/configuration/slice.js';
import type {StateMutation} from '@/src/core/interface/types.js';
import type {ConfigurationState} from './types.js';

/**
 * Configuration mutations
 */
export const setOrganizationId = (organizationId: string): StateMutation => {
  return configurationSlice.actions.setOrganizationId(organizationId);
};

export const setAccessToken = (accessToken: string): StateMutation => {
  return configurationSlice.actions.setAccessToken(accessToken);
};

export const setEndpoint = (endpoint: string | undefined): StateMutation => {
  return configurationSlice.actions.setEndpoint(endpoint);
};

export const setConfiguration = (config: ConfigurationState): StateMutation => {
  return configurationSlice.actions.setConfiguration(config);
};
