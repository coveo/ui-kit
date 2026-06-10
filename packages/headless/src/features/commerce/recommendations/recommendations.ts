import {z} from '@coveo/bueno/zod';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export const recommendationsSlotDefinition = z.object({
  slotId: requiredNonEmptyString,
  productId: z.optional(z.string().check(z.minLength(1))),
});

export const recommendationsOptionsSchema = recommendationsSlotDefinition;
