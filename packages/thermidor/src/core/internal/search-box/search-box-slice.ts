import {createSlice} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';

export interface SearchBoxState {
  query: string;
}

export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

export function createSearchBoxSlice(interfaceId: string) {
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

export const getOrCreateSearchBoxSlice = SingletonFactory(createSearchBoxSlice);
