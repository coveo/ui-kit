import {createSlice} from '@reduxjs/toolkit';
import {getOrCreateQueryCorrectionActions} from './query-correction-actions.js';
import type {QueryCorrection} from './query-correction-actions.js';

export interface QueryCorrectionState {
  correction: QueryCorrection | null;
}

export const initialQueryCorrectionState: QueryCorrectionState = {
  correction: null,
};

export function createQueryCorrectionSlice(interfaceId: string) {
  const actions = getOrCreateQueryCorrectionActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/queryCorrection`,
    initialState: initialQueryCorrectionState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setQueryCorrection, (state, action) => {
        state.correction = action.payload;
      });
    },
  });
}

const sliceCache = new Map<
  string,
  ReturnType<typeof createQueryCorrectionSlice>
>();
export function getOrCreateQueryCorrectionSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createQueryCorrectionSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
