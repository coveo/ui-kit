/**
 * SharedContext Feature Slice (Redux Implementation)
 *
 * INTERNAL to Layer 0. NEVER export from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  SharedContextState,
  CitationLink,
} from '@/src/core/interface/shared-context/shared-context-types.js';

export const initialSharedContextState: SharedContextState = {
  selectedProducts: [],
  activeQuery: undefined,
  activeFilters: {},
  citations: [],
};

export const sharedContextSlice = createSlice({
  name: 'sharedContext',
  initialState: initialSharedContextState,
  reducers: {
    rehydrateContext: (_state, action: PayloadAction<SharedContextState>) => {
      return action.payload;
    },
    setSelectedProducts: (state, action: PayloadAction<string[]>) => {
      state.selectedProducts = action.payload;
    },
    setActiveQuery: (state, action: PayloadAction<string | undefined>) => {
      state.activeQuery = action.payload;
    },
    setActiveFilters: (
      state,
      action: PayloadAction<Record<string, string[]>>
    ) => {
      state.activeFilters = action.payload;
    },
    addCitation: (state, action: PayloadAction<CitationLink>) => {
      const exists = state.citations.some((c) => c.id === action.payload.id);
      if (!exists) {
        state.citations.push(action.payload);
      }
    },
    clearContext: (state) => {
      state.selectedProducts = [];
      state.activeQuery = undefined;
      state.activeFilters = {};
      state.citations = [];
    },
  },
  selectors: {
    selectedProducts: (state) => state.selectedProducts,
    activeQuery: (state) => state.activeQuery,
    activeFilters: (state) => state.activeFilters,
    citations: (state) => state.citations,
  },
});
