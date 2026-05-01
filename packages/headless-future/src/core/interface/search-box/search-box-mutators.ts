/**
 * SearchBox Feature Mutations
 *
 * Provides library-agnostic mutation API for searchBox state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the searchBox slice is not loaded, mutations will have no effect.
 */

import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';

/**
 * SearchBox mutations
 */

export const setQuery = (query: string): StateMutation => {
  return searchBoxSlice.actions.setQuery(query);
};
