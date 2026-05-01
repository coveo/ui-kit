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
import {Engine} from '@/src/core/interface/engine/engine.js';
import type {ConfigurationState} from './configuration-types.js';

/**
 * Configuration mutations
 */
export const setOrganizationId = (engine: Engine, organizationId: string) => {
  engine.mutate(configurationSlice.actions.setOrganizationId(organizationId));
};

export const setAccessToken = (engine: Engine, accessToken: string) => {
  engine.mutate(configurationSlice.actions.setAccessToken(accessToken));
};

export const setEndpoint = (engine: Engine, endpoint: string | undefined) => {
  engine.mutate(configurationSlice.actions.setEndpoint(endpoint));
};

export const setConfiguration = (
  engine: Engine,
  config: ConfigurationState
) => {
  engine.mutate(configurationSlice.actions.setConfiguration(config));
};
