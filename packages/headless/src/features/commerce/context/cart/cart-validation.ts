import {z} from '@coveo/bueno/zod';
import {requiredNonEmptyString} from '../../../../utils/validate-payload.js';

export const itemPayloadDefinition = z.object({
  productId: requiredNonEmptyString,
  quantity: z.number().check(z.minimum(0)),
  name: z.string(),
  price: z.number().check(z.minimum(0)),
});

export const setItemsPayloadDefinition = z.array(itemPayloadDefinition);

export const cartDefinition = z.object({
  items: z.optional(setItemsPayloadDefinition),
});

export const cartSchema = cartDefinition;
