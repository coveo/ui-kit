import {createAction} from '@reduxjs/toolkit';
import {QueryParam} from '../../api/search/search-api-params';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {stateParametersDefinition} from './state-parameters-schema';

export type StateParameters = QueryParam;

/** Restores state parameters from e.g. a url*/
export const restoreState = createAction(
  'stateManager/restore',
  (payload: StateParameters) =>
    validatePayloadSchema(payload, stateParametersDefinition)
);
