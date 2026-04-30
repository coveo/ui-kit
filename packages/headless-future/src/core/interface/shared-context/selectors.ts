/**
 * SharedContext Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {sharedContextSlice} from '@/src/core/internal/shared-context/slice.js';
import type {SharedContextState} from './types.js';

export type StateWithSharedContextSlice = {sharedContext: SharedContextState};

export const selectedProducts = (state: StateWithSharedContextSlice) =>
  sharedContextSlice.selectors.selectedProducts(state);

export const activeQuery = (state: StateWithSharedContextSlice) =>
  sharedContextSlice.selectors.activeQuery(state);

export const activeFilters = (state: StateWithSharedContextSlice) =>
  sharedContextSlice.selectors.activeFilters(state);

export const citations = (state: StateWithSharedContextSlice) =>
  sharedContextSlice.selectors.citations(state);
