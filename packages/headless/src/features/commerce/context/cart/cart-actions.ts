import { createAction } from '@reduxjs/toolkit';
import {nonEmptyString, validatePayload} from '../../../../utils/validate-payload';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import { ArrayValue, NumberValue, RecordValue } from '@coveo/bueno';

const cartItemDefinition = {
  product: new RecordValue({
    options: {required: true},
    values: {
      groupId: nonEmptyString,
      productId: nonEmptyString,
      sku: nonEmptyString
    }
  }),
  quantity: new NumberValue({
    required: true,
    min: 1,
  })
}
export interface SetCartPayload {
  cart: CartItemParam[]
}

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: SetCartPayload) =>
    validatePayload(payload, {
      cart: new ArrayValue({
        each: new RecordValue({
          values: {
            ...cartItemDefinition
          }
        }),
      })
    })
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
