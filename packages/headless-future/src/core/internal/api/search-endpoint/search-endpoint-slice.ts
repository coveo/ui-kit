import {
  SearchEndpointState,
  SearchEndpointStatus,
} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export const initialSearchEndpointState: SearchEndpointState = {
  configuration: {},
  status: 'idle',
  error: null,
};

export const searchEndpointSlice = createSlice({
  name: 'searchEndpoint',
  initialState: initialSearchEndpointState,
  reducers: {
    setStatus: (state, action: PayloadAction<SearchEndpointStatus>) => {
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
