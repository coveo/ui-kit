import {
  SearchApiState,
  SearchApiStatus,
} from '@/src/core/interface/api/search-api/search-api-types.js';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export const initialSearchApiState: SearchApiState = {
  configuration: {},
  status: 'idle',
  error: null,
};

export const searchApiSlice = createSlice({
  name: 'searchApi',
  initialState: initialSearchApiState,
  reducers: {
    setStatus: (state, action: PayloadAction<SearchApiStatus>) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConfiguration: (state, action: PayloadAction<Record<string, any>>) => {
      state.configuration = action.payload;
    },
  },
  selectors: {
    status: (state) => state.status,
    error: (state) => state.error,
    configuration: (state) => state.configuration,
  },
});
