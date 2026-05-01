/**
 * Result Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the result (singular) feature.
 * It manages per-result ephemeral UI state (selected, expanded, etc.).
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  ResultMapState,
  ResultState,
} from '@/src/core/interface/result/result-types.js';

/**
 * Default state for an individual result entry
 */
export const defaultResultState: ResultState = {
  isSelected: false,
  isExpanded: false,
};

/**
 * Initial result state (empty map)
 */
export const initialResultState: ResultMapState = {};

/**
 * Result slice manages per-result UI state
 */
export const resultSlice = createSlice({
  name: 'result',
  initialState: initialResultState,
  reducers: {
    initializeResults: (_state, action: PayloadAction<string[]>) => {
      // Reset to only the provided IDs, each with default state
      const newState: ResultMapState = {};
      for (const id of action.payload) {
        newState[id] = {...defaultResultState};
      }
      return newState;
    },
    setSelected: (
      state,
      action: PayloadAction<{id: string; isSelected: boolean}>
    ) => {
      const {id, isSelected} = action.payload;
      if (state[id]) {
        state[id].isSelected = isSelected;
      }
    },
    setExpanded: (
      state,
      action: PayloadAction<{id: string; isExpanded: boolean}>
    ) => {
      const {id, isExpanded} = action.payload;
      if (state[id]) {
        state[id].isExpanded = isExpanded;
      }
    },
    clearAll: () => {
      return {};
    },
  },
  selectors: {
    all: (state) => state,
    byId: (state, id: string) => state[id],
    selectedIds: (state) =>
      Object.entries(state)
        .filter(([, result]) => result.isSelected)
        .map(([id]) => id),
    expandedIds: (state) =>
      Object.entries(state)
        .filter(([, result]) => result.isExpanded)
        .map(([id]) => id),
  },
});
