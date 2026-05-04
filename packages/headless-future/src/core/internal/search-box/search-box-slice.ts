/**
 * SearchBox Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the searchBox feature.
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {SearchBoxState} from '@/src/core/interface/search-box/search-box-types.js';

/**
 * Initial searchBox state
 */
export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

/**
 * SearchBox slice manages the search query string
 */
export const searchBoxSlice = createSlice({
  name: 'searchBox',
  initialState: initialSearchBoxState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
  },
  selectors: {
    query: (state) => state.query,
  },
});
