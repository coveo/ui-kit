import {createAction} from '@reduxjs/toolkit';
import {QueryParam} from '../../api/search/search-api-params';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {stateParametersDefinition} from './state-parameters-schema';

export type SearchParameters = QueryParam;

/** Restores search parameters from e.g. a url*/
export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validatePayloadSchema(payload, stateParametersDefinition)
);
