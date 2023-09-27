import {ArrayValue, NumberValue, RecordValue, Schema} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';

export const cartItemDefinition = {
  productId: requiredNonEmptyString,
  quantity: new NumberValue({
    required: true,
    min: 1,
  }),
};

export const itemsDefinition = new ArrayValue({
  each: new RecordValue({
    values: {
      ...cartItemDefinition,
    },
  }),
});

export const cartDefinition = {
  items: itemsDefinition,
};

export const cartSchema = new Schema(cartDefinition);
