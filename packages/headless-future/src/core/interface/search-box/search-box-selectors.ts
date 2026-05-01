/**
 * SearchBox Feature Selectors
 *
 * Provides library-agnostic selectors for reading searchBox state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import type {SearchBoxState} from './search-box-types.js';

export type StateWithSearchBoxSlice = {searchBox: SearchBoxState};

export const query = (state: StateWithSearchBoxSlice) => {
  return searchBoxSlice.selectors.query(state);
};
