/**
 * SharedContext Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {sharedContextSlice} from '@/src/core/internal/shared-context/shared-context-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {CitationLink, SharedContextState} from './shared-context-types.js';

export const rehydrateContext = (payload: SharedContextState): StateMutation =>
  sharedContextSlice.actions.rehydrateContext(payload);

export const setSelectedProducts = (products: string[]): StateMutation =>
  sharedContextSlice.actions.setSelectedProducts(products);

export const setActiveQuery = (query: string | undefined): StateMutation =>
  sharedContextSlice.actions.setActiveQuery(query);

export const setActiveFilters = (
  filters: Record<string, string[]>
): StateMutation => sharedContextSlice.actions.setActiveFilters(filters);

export const addCitation = (citation: CitationLink): StateMutation =>
  sharedContextSlice.actions.addCitation(citation);

export const clearContext = (): StateMutation =>
  sharedContextSlice.actions.clearContext();
