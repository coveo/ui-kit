import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload.js';
import type {Parameters} from '../parameters/parameters-actions.js';
import {parametersDefinition} from '../parameters/parameters-schema.js';

export type ProductListingParameters = Parameters;

export type RestoreProductListingParametersPayload = ProductListingParameters;

export const restoreProductListingParameters = createAction(
  'commerce/productListingParameters/restore',
  (payload: RestoreProductListingParametersPayload) =>
    validatePayload(payload, parametersDefinition)
);
