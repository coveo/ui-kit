import {StringValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {QueryParam} from '../../api/search/search-api-params';
import {validatePayloadSchema} from '../../utils/validate-payload';

export type StateParameters = QueryParam;

const restoreStateDefinition = {
  q: new StringValue(),
};

/** Restores state parameters from e.g. a url*/
export const restoreState = createAction(
  'stateManager/restore',
  (payload: StateParameters) =>
    validatePayloadSchema(payload, restoreStateDefinition)
);
