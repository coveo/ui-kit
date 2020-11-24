import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {QueryParam} from '../../api/search/search-api-params';
import {updateQuery} from '../query/query-actions';

export type StateParameters = QueryParam;

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
