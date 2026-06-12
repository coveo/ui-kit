import * as z from '@coveo/bueno/zod';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export const facetValueDefinition = z.object({
  value: requiredNonEmptyString,
  numberOfResults: z.optional(z.number().check(z.minimum(0))),
  state: z.enum(['idle', 'selected', 'excluded']),
});
