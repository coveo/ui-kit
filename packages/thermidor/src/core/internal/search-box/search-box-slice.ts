import {createSlice} from '@reduxjs/toolkit';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';

export interface SearchBoxState {
  query: string;
}

export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

function createSearchBoxSlice(interfaceId: string) {
  const actions = getOrCreateSearchBoxActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/searchBox`,
    initialState: initialSearchBoxState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setQuery, (state, action) => {
        state.query = action.payload;
      });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createSearchBoxSlice>>();
export function getOrCreateSearchBoxSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createSearchBoxSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
