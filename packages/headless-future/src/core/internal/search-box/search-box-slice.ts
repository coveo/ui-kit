import {createSlice} from '@reduxjs/toolkit';
import {setQuery} from './search-box-actions.js';

export interface SearchBoxState {
  query: string;
}

export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

export const searchBoxSlice = createSlice({
  name: 'searchBox',
  initialState: initialSearchBoxState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setQuery, (state, action) => {
      state.query = action.payload;
    });
  },
  selectors: {
    query: (state) => state.query,
  },
});
