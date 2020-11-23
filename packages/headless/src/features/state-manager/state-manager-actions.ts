import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {updateQuery} from '../query/query-actions';

export interface StateParameters {
  q?: string;
}

/** Restores state parameters (e.g. from a url)*/
export const restoreState = createAction(
  'stateManager/restore',
  (parameters: StateParameters) => ({payload: parameters})
);

/** Restores state parameters (e.g. from a url)*/
export const restoreStateAsync = createAsyncThunk<void, StateParameters>(
  'stateManger/restoreAsync',
  (parameters: StateParameters, {dispatch}) => {
    if ('q' in parameters) {
      dispatch(updateQuery({q: parameters.q}));
    }
  }
);
