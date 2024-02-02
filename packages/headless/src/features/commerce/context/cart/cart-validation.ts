import {ArrayValue, NumberValue, RecordValue, Schema} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';

export const productIdDefinition = {
  productId: requiredNonEmptyString,
};

export const basicCartItemDefinition = {
  ...productIdDefinition,
  quantity: new NumberValue({
    required: true,
    min: 1,
  }),
};

const cartItemMetadataDefinition = {
  name: requiredNonEmptyString,
  price: new NumberValue({
    required: true,
    min: 0,
  }),
};

export const cartItemMetadataWithProductIdDefinition = {
  ...productIdDefinition,
  ...cartItemMetadataDefinition,
};

export const cartItemsDefinition = new ArrayValue({
  each: new RecordValue({
    values: {
      ...basicCartItemDefinition,
      ...cartItemMetadataDefinition,
    },
  }),
});

export const cartDefinition = {
  items: cartItemsDefinition,
};

export const cartSchema = new Schema(cartDefinition);
