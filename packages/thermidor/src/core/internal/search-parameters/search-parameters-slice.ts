import {createSlice} from '@reduxjs/toolkit';
import {getOrCreateSearchParametersActions} from './search-parameters-actions.js';

export interface SearchParametersState {
  pipeline: string;
  cq: string;
}

export const initialSearchParametersState: SearchParametersState = {
  pipeline: '',
  cq: '',
};

function createSearchParametersSlice(interfaceId: string) {
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

const sliceCache = new Map<
  string,
  ReturnType<typeof createSearchParametersSlice>
>();
export function getOrCreateSearchParametersSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createSearchParametersSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
