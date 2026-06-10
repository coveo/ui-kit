import {z} from '@coveo/bueno/zod';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../utils/validate-payload.js';

export const staticFilterIdSchema = requiredNonEmptyString;

export const staticFilterValueSchema = z.object({
  caption: requiredEmptyAllowedString,
  expression: requiredEmptyAllowedString,
  state: z.optional(z.enum(['idle', 'selected', 'excluded'] as const)),
});

export const staticFilterValuesSchema = z.array(staticFilterValueSchema);
