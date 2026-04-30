/**
 * Result Feature Mutations (Singular)
 *
 * Provides library-agnostic mutation API for per-result UI state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the result slice is not loaded, mutations will have no effect.
 */

import {resultSlice} from '@/src/core/internal/result/slice.js';
import type {StateMutation} from '@/src/core/interface/types.js';

/**
 * Initialize result UI state for a set of result IDs.
 * Replaces any existing state entirely.
 */
export const initializeResults = (ids: string[]): StateMutation => {
  return resultSlice.actions.initializeResults(ids);
};

/**
 * Set whether a specific result is selected.
 */
export const setSelected = (id: string, isSelected: boolean): StateMutation => {
  return resultSlice.actions.setSelected({id, isSelected});
};

/**
 * Set whether a specific result is expanded.
 */
export const setExpanded = (id: string, isExpanded: boolean): StateMutation => {
  return resultSlice.actions.setExpanded({id, isExpanded});
};

/**
 * Clear all per-result UI state.
 */
export const clearAll = (): StateMutation => {
  return resultSlice.actions.clearAll();
};
