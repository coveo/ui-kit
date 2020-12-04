import {createAction} from '@reduxjs/toolkit';
import {SearchRequest} from '../../api/search/search/search-request';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {searchParametersDefinition} from './search-parameter-schema';

export type SearchParameters = Omit<
  SearchRequest,
  | 'organizationId'
  | 'accessToken'
  | 'visitorId'
  | 'url'
  | 'enableDidYouMean'
  | 'fieldsToInclude'
  | 'facetOptions'
  | 'facets'
  | 'searchHub'
  | 'pipeline'
  | 'context'
  | 'debug'
>;

/** Restores search parameters from e.g. a url*/
export const restoreSearchParameters = createAction(
  'searchParameters/restore',
  (payload: SearchParameters) =>
    validatePayloadSchema(payload, searchParametersDefinition)
);
