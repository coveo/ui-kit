import { createAction } from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import { ArrayValue, NumberValue, RecordValue } from '@coveo/bueno';

export interface SetCartPayload {
  cart: CartItemParam[]
}
export const setCart = createAction(
  'commerce/cart/set',
  (payload: SetCartPayload) =>
    validatePayload(payload, {
      cart: new ArrayValue({
        each: new RecordValue({
          values: {
            product: new RecordValue({
              options: {required: true}
            }),
            quantity: new NumberValue({
              required: true,
              min: 1,
            })
          }
        }),
      })
    })
);

const cartItemDefinition = {
  product: new RecordValue({
    options: {required: true}
  }),
  quantity: new NumberValue({
    required: true,
    min: 1,
  })
}

export type AddCartItemPayload = CartItemParam;

export const addCartItem = createAction(
  'commerce/cart/addItem',
  (payload: AddCartItemPayload) => validatePayload(payload, cartItemDefinition)
);

export type RemoveCartItemPayload = CartItemParam;

export const removeCartItem = createAction(
  'commerce/cart/removeItem',
  (payload: RemoveCartItemPayload) => validatePayload(payload, cartItemDefinition)
);

export type UpdateCartItemQuantity = CartItemParam;

export const updateCartItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: UpdateCartItemQuantity) => validatePayload(payload, cartItemDefinition)
);
