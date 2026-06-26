import {createSlice} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {getOrCreateSearchParametersActions} from './search-parameters-actions.js';

export interface SearchParametersState {
  pipeline: string;
  cq: string;
}

export const initialSearchParametersState: SearchParametersState = {
  pipeline: '',
  cq: '',
};

export function createSearchParametersSlice(interfaceId: string) {
  const actions = getOrCreateSearchParametersActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/searchParameters`,
    initialState: initialSearchParametersState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setPipeline, (state, action) => {
        state.pipeline = action.payload;
      });
      builder.addCase(actions.setConstantQuery, (state, action) => {
        state.cq = action.payload;
      });
    },
  });
}

export const getOrCreateSearchParametersSlice = SingletonFactory(
  createSearchParametersSlice
);
