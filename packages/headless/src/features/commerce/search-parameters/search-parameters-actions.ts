import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload.js';
import type {Parameters} from '../parameters/parameters-actions.js';
import {searchParametersDefinition} from './search-parameters-schema.js';

/**
 * The parameters affecting the search response.
 */
export interface CommerceSearchParameters extends Parameters {
  /**
   * The query.
   */
  q?: string;
}

export type RestoreSearchParametersPayload = CommerceSearchParameters;

export const restoreSearchParameters = createAction(
  'commerce/searchParameters/restore',
  (payload: RestoreSearchParametersPayload) =>
    validatePayload(payload, searchParametersDefinition)
);
