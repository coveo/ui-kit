import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {SearchBoxState} from '@/src/core/interface/search-box/search-box-types.js';

export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

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
