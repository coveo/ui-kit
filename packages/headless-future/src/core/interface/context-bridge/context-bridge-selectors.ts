/**
 * ContextBridge Feature Selectors
 *
 * Library-agnostic selectors. No Redux types exposed.
 */

import {contextBridgeSlice} from '@/src/core/internal/context-bridge/context-bridge-slice.js';
import type {ContextBridgeState} from './context-bridge-types.js';

export type StateWithContextBridgeSlice = {contextBridge: ContextBridgeState};

export const selectedProducts = (state: StateWithContextBridgeSlice) =>
  contextBridgeSlice.selectors.selectedProducts(state);

export const activeQuery = (state: StateWithContextBridgeSlice) =>
  contextBridgeSlice.selectors.activeQuery(state);

export const activeFilters = (state: StateWithContextBridgeSlice) =>
  contextBridgeSlice.selectors.activeFilters(state);

export const citations = (state: StateWithContextBridgeSlice) =>
  contextBridgeSlice.selectors.citations(state);
