import type {SearchEndpointState} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';
import {createSlice} from '@reduxjs/toolkit';
import * as searchEndpointActions from './search-endpoint-actions.js';

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
    builder.addCase(searchEndpointActions.setStatus, (state, action) => {
      state.status = action.payload;
    });
    builder.addCase(searchEndpointActions.setError, (state, action) => {
      state.error = action.payload;
    });
    builder.addCase(searchEndpointActions.setConfiguration, (state, action) => {
      state.configuration = action.payload;
    });
  },
});
