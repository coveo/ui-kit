import {createAction} from '@reduxjs/toolkit';
import {CartItemParam} from '../../../../api/commerce/commerce-api-params';
import {validatePayload} from '../../../../utils/validate-payload';
import {CartItemMetadata} from './cart-state';
import {
  setItemsPayloadDefinition,
  updateItemPayloadDefinition,
} from './cart-validation';

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: (CartItemParam & CartItemMetadata)[]) =>
    validatePayload<CartItemParam[]>(payload, setItemsPayloadDefinition)
);

export const updateItem = createAction(
  'commerce/cart/updateItem',
  (payload: CartItemParam & CartItemMetadata) =>
    validatePayload(payload, updateItemPayloadDefinition)
);
