import {createAction} from '@reduxjs/toolkit';
import {
  ProductListingSortCriterion,
  ProductListingSortBy,
} from './product-listing-sort';
import {validatePayload} from '../../utils/validate-payload';
import {EnumValue, SchemaDefinition} from '@coveo/bueno';

const criterionDefinition = {
  by: new EnumValue<ProductListingSortBy>({
    enum: ProductListingSortBy,
    required: true,
  }),
} as SchemaDefinition<ProductListingSortCriterion>;

export const registerProductListingSortCriterion = createAction(
  'productListingSortCriterion/register',
  (payload: ProductListingSortCriterion) => validate(payload)
);

export const updateProductListingSortCriterion = createAction(
  'productListingSortCriterion/update',
  (payload: ProductListingSortCriterion) => validate(payload)
);

const validate = (payload: ProductListingSortCriterion) =>
  validatePayload(payload, criterionDefinition);
