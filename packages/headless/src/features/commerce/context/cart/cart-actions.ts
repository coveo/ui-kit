import {createAction} from '@reduxjs/toolkit';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../../utils/validate-payload';
import {
  basicCartItemDefinition,
  cartItemsDefinition,
  cartItemMetadataWithProductIdDefinition,
} from './cart-validation';

export interface CartItemMetadata extends Pick<CartItemParam, 'productId'> {
  name?: string;
  price?: number;
}

export interface AugmentedCartItemParam
  extends CartItemParam,
    CartItemMetadata {}

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: Required<AugmentedCartItemParam>[]) =>
    validatePayload<CartItemParam[]>(payload, cartItemsDefinition)
);

export const updateItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: CartItemParam) => validatePayload(payload, basicCartItemDefinition)
);

export const updateItemMetadata = createAction(
  'commerce/cart/updateItemMetadata',
  (payload: CartItemMetadata) =>
    validatePayload(payload, cartItemMetadataWithProductIdDefinition)
);
