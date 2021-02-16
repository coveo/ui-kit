import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchAppState} from '../../state/search-app-state';
import {HistoryState} from './history-state';

export const undo = createAction('history/undo');
export const redo = createAction('history/redo');

/**
 * Creates a snapshot of the current request parameters and adds it to the interface history.
 * @param (SearchParametersState) The current state of the search parameters.
 */
export const snapshot = createAction<HistoryState>('history/snapshot');

/**
 * Moves backward in the interface history.
 */
export const back = createAsyncThunk('history/back', async (_, {dispatch}) => {
  dispatch(undo());
  await dispatch(change());
});

/**
 * Moves forward in the interface history.
 */
export const forward = createAsyncThunk(
  'history/forward',
  async (_, {dispatch}) => {
    dispatch(redo());
    await dispatch(change());
  }
);

/**
 * Updates the interface state as per the current step in the interface history.
 */
export const change = createAsyncThunk(
  'history/change',
  async (_, {getState}) => {
    const s = getState() as SearchAppState;
    return s.history.present;
  }
);
