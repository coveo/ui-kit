import {createAction} from '@reduxjs/toolkit';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload';
import {cartItemDefinition, itemsDefinition} from './cart-validation';

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: CartItemParam[]) =>
    validatePayload<CartItemParam[]>(payload, itemsDefinition)
);

export type AddCartItemPayload = CartItemParam;

export const addItem = createAction(
  'commerce/cart/addItem',
  (payload: AddCartItemPayload) => validatePayload(payload, cartItemDefinition)
);

export const removeItem = createAction(
  'commerce/cart/removeItem',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

export type UpdateItemQuantity = CartItemParam;

export const updateItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: UpdateItemQuantity) => validatePayload(payload, cartItemDefinition)
);
