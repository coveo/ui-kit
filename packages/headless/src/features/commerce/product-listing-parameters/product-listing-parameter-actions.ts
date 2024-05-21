import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {productListingParametersDefinition} from '../search-parameters/search-parameter-schema';
import {Parameters} from '../search-parameters/search-parameter-actions';

export type ProductListingParameters = Parameters;

// TODO CAPI-546: Add a case for this action in the product listing slice
export const restoreProductListingParameters = createAction(
  'commerce/productListingParameters/restore',
  (payload: ProductListingParameters) =>
    validatePayload(payload, productListingParametersDefinition)
);