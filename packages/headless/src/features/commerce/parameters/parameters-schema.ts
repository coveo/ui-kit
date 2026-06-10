import * as z from '@coveo/bueno/zod';
import type {Parameters} from './parameters-actions.js';

export const parametersDefinitionShape = {
  f: z.optional(z.record(z.string(), z.unknown())),
  fExcluded: z.optional(z.record(z.string(), z.unknown())),
  lf: z.optional(z.record(z.string(), z.unknown())),
  cf: z.optional(z.record(z.string(), z.unknown())),
  nf: z.optional(z.record(z.string(), z.unknown())),
  nfExcluded: z.optional(z.record(z.string(), z.unknown())),
  mnf: z.optional(z.record(z.string(), z.unknown())),
  mnfExcluded: z.optional(z.record(z.string(), z.unknown())),
  df: z.optional(z.record(z.string(), z.unknown())),
  dfExcluded: z.optional(z.record(z.string(), z.unknown())),
  sortCriteria: z.optional(z.record(z.string(), z.unknown())),
  page: z.optional(z.number().check(z.minimum(0))),
  perPage: z.optional(z.number().check(z.minimum(1))),
};

export const parametersDefinition = z.object(
  parametersDefinitionShape
) as unknown as z.ZodMiniType<Required<Parameters>>;
