import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {Parameters} from '../parameters/parameters-actions';
import {parametersDefinition} from '../parameters/parameters-schema';

export type ProductListingParameters = Parameters;

export type RestoreProductListingParametersPayload = ProductListingParameters;

export const restoreProductListingParameters = createAction(
  'commerce/productListingParameters/restore',
  (payload: RestoreProductListingParametersPayload) =>
    validatePayload(payload, parametersDefinition)
);
