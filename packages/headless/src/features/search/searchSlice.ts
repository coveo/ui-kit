import {search} from '../../api/search/search';
import {createReducer, createAsyncThunk} from '@reduxjs/toolkit';

export enum SearchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface SearchState {
  status: SearchStatus;
}

const initialState: SearchState = {
  status: SearchStatus.IDLE,
};

export const searchReducer = createReducer(initialState, builder =>
  builder
    .addCase(performSearch.pending, state => {
      state.status = SearchStatus.LOADING;
    })
    .addCase(performSearch.fulfilled, state => {
      state.status = SearchStatus.SUCCESS;
    })
    .addCase(performSearch.rejected, state => {
      state.status = SearchStatus.FAIL;
    })
);

export const performSearch = createAsyncThunk(
  'search',
  async (_, {getState}) => {
    return await search(getState());
  }
);
