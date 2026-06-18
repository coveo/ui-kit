import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {initialConfigurationState} from './configuration-slice.js';

function selectConfigurationSlice(
  state: Record<string, unknown>
): typeof initialConfigurationState {
  const slice = state['configuration'];
  return slice === undefined
    ? initialConfigurationState
    : (slice as typeof initialConfigurationState);
}

export function createConfigurationSelectors() {
  return {
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
