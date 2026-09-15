import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {initialConfigurationState} from './configuration-slice.js';
import type {State} from '@/src/internal/engine/engine-types.js';

// ---------------------------------------------------------------------------
// Factory-based selectors (formerly core/internal/configuration/configuration-selectors.ts)
// ---------------------------------------------------------------------------

function selectConfigurationSlice(state: State) {
  return state.configuration ?? initialConfigurationState;
}

function createConfigurationSelectors() {
  return {
    getTrackingId: createMemoizedStateSelector(
      selectConfigurationSlice,
      (state) => state.trackingId
    ),
    getLanguage: createMemoizedStateSelector(selectConfigurationSlice, (state) => state.language),
    getCountry: createMemoizedStateSelector(selectConfigurationSlice, (state) => state.country),
    getCurrency: createMemoizedStateSelector(selectConfigurationSlice, (state) => state.currency),
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

let cachedSelectors: ReturnType<typeof createConfigurationSelectors> | null = null;

export function getOrCreateConfigurationSelectors() {
  if (!cachedSelectors) {
    cachedSelectors = createConfigurationSelectors();
  }
  return cachedSelectors;
}
