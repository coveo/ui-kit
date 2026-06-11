import type {SearchEndpointState} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';
import {createSlice} from '@reduxjs/toolkit';
import {
  setStatus,
  setError,
  setConfiguration,
} from './search-endpoint-actions.js';

export const initialSearchEndpointState: SearchEndpointState = {
  configuration: {},
  status: 'idle',
  error: null,
};

export const searchEndpointSlice = createSlice({
  name: 'searchEndpoint',
  initialState: initialSearchEndpointState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setStatus, (state, action) => {
      state.status = action.payload;
    });
    builder.addCase(setError, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(setConfiguration, (state, action) => {
      state.configuration = action.payload;
    });
  },
});
