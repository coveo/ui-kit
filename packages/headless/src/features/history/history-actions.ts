import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import type {SearchAppState} from '../../state/search-app-state.js';
import type {HistoryState} from './history-state.js';

export const undo = createAction('history/undo');
export const redo = createAction('history/redo');

export const snapshot = createAction<HistoryState>('history/snapshot');

export const back = createAsyncThunk('history/back', async (_, {dispatch}) => {
  dispatch(undo());
  await dispatch(change());
});

export const forward = createAsyncThunk(
  'history/forward',
  async (_, {dispatch}) => {
    dispatch(redo());
    await dispatch(change());
  }
);

export const change = createAsyncThunk(
  'history/change',
  async (_, {getState}) => {
    const s = getState() as SearchAppState;
    return s.history.present;
  }
);
