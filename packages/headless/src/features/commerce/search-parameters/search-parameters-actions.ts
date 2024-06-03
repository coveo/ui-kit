import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {Parameters} from '../parameters/parameters-actions';
import {searchParametersDefinition} from './search-parameters-schema';

/**
 * The parameters affecting the search response.
 */
export interface CommerceSearchParameters extends Parameters {
  /**
   * The query.
   */
  q?: string;
}

export type RestoreSearchParametersActionCreatorPayload =
  CommerceSearchParameters;

export const restoreSearchParameters = createAction(
  'commerce/searchParameters/restore',
  (payload: RestoreSearchParametersActionCreatorPayload) =>
    validatePayload(payload, searchParametersDefinition)
);
