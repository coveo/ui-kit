import * as z from '@coveo/bueno/zod';
import {
  nonEmptyString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload.js';

export const productEnrichmentDefinition = z.object({
  placementIds: z.optional(
    z.array(requiredNonEmptyString).check(z.minLength(1))
  ),
  productId: nonEmptyString,
});

export const productEnrichmentOptionsSchema = productEnrichmentDefinition;
