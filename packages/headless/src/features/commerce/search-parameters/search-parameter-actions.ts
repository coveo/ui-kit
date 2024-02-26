import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {
  productListingParametersDefinition,
  searchParametersDefinition,
} from './search-parameter-schema';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Parameters {}

/**
 * The parameters affecting the search response.
 */
export interface CommerceSearchParameters extends Parameters {
  /**
   * The query.
   */
  q?: string;
}

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Extract to its own file
export interface ProductListingParameters extends Parameters {}

export const restoreSearchParameters = createAction(
  'commerce/searchParameters/restore',
  (payload: CommerceSearchParameters) =>
    validatePayload(payload, searchParametersDefinition)
);

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Add a case for this action in the product listing slice
export const restoreProductListingParameters = createAction(
  'commerce/productListingParameters/restore',
  (payload: ProductListingParameters) =>
    validatePayload(payload, productListingParametersDefinition)
);
