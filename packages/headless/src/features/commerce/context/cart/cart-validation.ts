import {
  ArrayValue,
  NumberValue,
  RecordValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';

export const updateItemPayloadDefinition = {
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
      ...updateItemPayloadDefinition,
    },
  }),
});

export const cartDefinition = {
  items: setItemsPayloadDefinition,
};

export const cartSchema = new Schema(cartDefinition);
