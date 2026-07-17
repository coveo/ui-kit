import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {
  configurationSlice,
  initialConfigurationState,
} from './configuration-slice.js';
import type {ConfigurationState} from './configuration-types.js';
import type {State} from '@/src/internal/engine/engine-types.js';

// ---------------------------------------------------------------------------
// Standalone selectors (formerly core/interface/configuration/configuration-selectors.ts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Factory-based selectors (formerly core/internal/configuration/configuration-selectors.ts)
// ---------------------------------------------------------------------------

function selectConfigurationSlice(state: State) {
  return state.configuration ?? initialConfigurationState;
}

export function createConfigurationSelectors() {
  return {
    getOrganizationId: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.organizationId
    ),
    getAccessToken: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.accessToken
    ),
    getTrackingId: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.trackingId
    ),
    getLanguage: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.language
    ),
    getCountry: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.country
    ),
    getCurrency: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.currency
    ),
    getEndpoint: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.endpoint
    ),
    getEndpointClientConfiguration: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => ({
        organizationId: state.organizationId,
        accessToken: state.accessToken,
        endpoint: state.endpoint,
      })
    ),
  };
}

let cachedSelectors: ReturnType<typeof createConfigurationSelectors> | null =
  null;

export function getOrCreateConfigurationSelectors() {
  if (!cachedSelectors) {
    cachedSelectors = createConfigurationSelectors();
  }
  return cachedSelectors;
}
