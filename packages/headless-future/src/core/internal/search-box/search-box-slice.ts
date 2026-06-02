import {createSlice} from '@reduxjs/toolkit';
import * as searchBoxActions from './search-box-actions.js';

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
    builder.addCase(searchBoxActions.setQuery, (state, action) => {
      state.query = action.payload;
    });
  },
  selectors: {
    query: (state) => state.query,
  },
});
