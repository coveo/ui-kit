import {
  ArrayValue,
  NumberValue,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import type {CartInitialState} from '../../../../controllers/commerce/context/cart/headless-cart.js';
import {requiredNonEmptyString} from '../../../../utils/validate-payload.js';

export const itemPayloadDefinition = {
  productId: requiredNonEmptyString,
  quantity: new NumberValue({
    required: true,
    min: 0,
  }),
  name: new StringValue({required: false}),
  price: new NumberValue({required: false, min: 0}),
};

export const setItemsPayloadDefinition = new ArrayValue({
  each: new RecordValue({
    values: {
      ...itemPayloadDefinition,
    },
  }),
});

export const cartDefinition = {
  items: setItemsPayloadDefinition,
};

export const cartSchema = new Schema<CartInitialState>(cartDefinition);
