import {AsyncThunk, createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAppState} from '../../state/search-app-state.js';
import {HistoryState} from './history-state.js';
import { AsyncThunkConfig } from '../search/search-actions-thunk-processor.js';

export const undo = createAction('history/undo');
export const redo = createAction('history/redo');

export const snapshot = createAction<HistoryState>('history/snapshot');

export const back:  AsyncThunk<void,void,AsyncThunkConfig> = createAsyncThunk('history/back', async (_, {dispatch}) => {
  dispatch(undo());
  //@ts-ignore shut up redux.
  await dispatch(change());
});

export const forward:  AsyncThunk<void,void,AsyncThunkConfig> = createAsyncThunk(
  'history/forward',
  async (_, {dispatch}) => {
    dispatch(redo());
    //@ts-ignore shut up redux.
    await dispatch(change());
  }
);

export const change: AsyncThunk<HistoryState|undefined,void,AsyncThunkConfig> = createAsyncThunk(
  'history/change',
  async (_, {getState}) => {
    const s = getState() as SearchAppState;
    return s.history.present;
  }
);
