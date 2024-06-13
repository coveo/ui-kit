import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {Parameters} from '../parameters/parameters-actions';
import {parametersDefinition} from '../parameters/parameters-schema';

export type ProductListingParameters = Parameters;

export const restoreProductListingParameters = createAction(
  'commerce/productListingParameters/restore',
  (payload: ProductListingParameters) =>
    validatePayload(payload, parametersDefinition)
);
