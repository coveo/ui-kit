import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {cartItemDefinition, cartDefinition} from './cart-validation';

export interface SetCartPayload {
  cart: CartItemParam[];
}

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: SetCartPayload) => validatePayload(payload, cartDefinition)
);

export type AddCartItemPayload = CartItemParam;

export const addItem = createAction(
  'commerce/cart/addItem',
  (payload: AddCartItemPayload) => validatePayload(payload, cartItemDefinition)
);

export type RemoveItemPayload = CartItemParam;

export const removeItem = createAction(
  'commerce/cart/removeItem',
  (payload: RemoveItemPayload) => validatePayload(payload, cartItemDefinition)
);

export type UpdateItemQuantity = CartItemParam;

export const updateItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: UpdateItemQuantity) => validatePayload(payload, cartItemDefinition)
);
