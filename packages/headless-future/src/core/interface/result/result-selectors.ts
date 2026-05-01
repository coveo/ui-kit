/**
 * Result Feature Selectors (Singular)
 *
 * Provides library-agnostic selectors for reading per-result UI state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {resultSlice} from '@/src/core/internal/result/result-slice.js';
import type {ResultMapState} from './result-types.js';

type StateWithResultSlice = {result: ResultMapState};

/**
 * Select the full map of result UI states.
 */
export const all = (state: StateWithResultSlice) => {
  return resultSlice.selectors.all(state);
};

/**
 * Select the UI state for a specific result by ID.
 * Returns a selector function (factory pattern for parameterized selectors).
 */
export const byId = (id: string) => (state: StateWithResultSlice) => {
  return resultSlice.selectors.byId(state, id);
};

/**
 * Select all result IDs that are currently selected.
 */
export const selectedIds = (state: StateWithResultSlice) => {
  return resultSlice.selectors.selectedIds(state);
};

/**
 * Select all result IDs that are currently expanded.
 */
export const expandedIds = (state: StateWithResultSlice) => {
  return resultSlice.selectors.expandedIds(state);
};
