/**
 * Result Feature Mutations (Singular)
 *
 * Provides library-agnostic mutation API for per-result UI state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the result slice is not loaded, mutations will have no effect.
 */

import {resultSlice} from '@/src/core/internal/result/result-slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';

/**
 * Initialize result UI state for a set of result IDs.
 * Replaces any existing state entirely.
 */
export const initializeResults = (engine: Engine, ids: string[]) => {
  engine.mutate(resultSlice.actions.initializeResults(ids));
};

/**
 * Set whether a specific result is selected.
 */
export const setSelected = (
  engine: Engine,
  id: string,
  isSelected: boolean
) => {
  engine.mutate(resultSlice.actions.setSelected({id, isSelected}));
};

/**
 * Set whether a specific result is expanded.
 */
export const setExpanded = (
  engine: Engine,
  id: string,
  isExpanded: boolean
) => {
  engine.mutate(resultSlice.actions.setExpanded({id, isExpanded}));
};

/**
 * Clear all per-result UI state.
 */
export const clearAll = (engine: Engine) => {
  engine.mutate(resultSlice.actions.clearAll());
};
