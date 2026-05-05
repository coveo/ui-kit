/**
 * ContextBridge Feature Mutations
 *
 * Library-agnostic mutation API. No Redux types exposed.
 */

import {contextBridgeSlice} from '@/src/core/internal/context-bridge/context-bridge-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {CitationLink, ContextBridgeState} from './context-bridge-types.js';

export const rehydrateContext = (payload: ContextBridgeState): StateMutation =>
  contextBridgeSlice.actions.rehydrateContext(payload);

export const setSelectedProducts = (products: string[]): StateMutation =>
  contextBridgeSlice.actions.setSelectedProducts(products);

export const setActiveQuery = (query: string | undefined): StateMutation =>
  contextBridgeSlice.actions.setActiveQuery(query);

export const setActiveFilters = (
  filters: Record<string, string[]>
): StateMutation => contextBridgeSlice.actions.setActiveFilters(filters);

export const addCitation = (citation: CitationLink): StateMutation =>
  contextBridgeSlice.actions.addCitation(citation);

export const clearContext = (): StateMutation =>
  contextBridgeSlice.actions.clearContext();
