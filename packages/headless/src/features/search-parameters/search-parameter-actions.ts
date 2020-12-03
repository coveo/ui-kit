import {createAction} from '@reduxjs/toolkit';
import {
  EnableQuerySyntaxParam,
  QueryParam,
} from '../../api/search/search-api-params';
import {validateActionPayload} from '../../utils/validate-payload';
import {searchParametersDefinition} from './search-parameter-schema';

export type SearchParameters = QueryParam & EnableQuerySyntaxParam;

/** Restores search parameters from e.g. a url*/
export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validateActionPayload(payload, searchParametersDefinition)
);
