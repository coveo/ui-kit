import {ArrayValue, NumberValue, RecordValue, Schema} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';

export const cartItemDefinition = {
  productId: requiredNonEmptyString,
  quantity: new NumberValue({
    required: true,
    min: 1,
  }),
};

export const cartDefinition = {
  cart: new ArrayValue({
    each: new RecordValue({
      values: {
        ...cartItemDefinition,
      },
    }),
  }),
};

export const cartSchema = new Schema(cartDefinition);
