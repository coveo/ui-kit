import {createAction} from '@reduxjs/toolkit';
import {QueryParam} from '../../api/search/search-api-params';

export type StateParameters = QueryParam;

/** Restores state parameters (e.g. from a url)*/
export const restoreState = createAction(
  'stateManager/restore',
  (parameters: StateParameters) => ({payload: parameters})
);
