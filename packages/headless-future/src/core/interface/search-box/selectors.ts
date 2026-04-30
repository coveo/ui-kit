/**
 * SearchBox Feature Selectors
 *
 * Provides library-agnostic selectors for reading searchBox state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import type {SearchBoxState} from './types.js';

export type StateWithSearchBoxSlice = {searchBox: SearchBoxState};

export const query = (state: StateWithSearchBoxSlice) => {
  return searchBoxSlice.selectors.query(state);
};
