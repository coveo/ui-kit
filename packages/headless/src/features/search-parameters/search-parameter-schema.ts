import {z} from '@coveo/bueno/zod';

export const searchParametersDefinition = z.object({
  q: z.optional(z.string()),
  enableQuerySyntax: z.optional(z.boolean()),
  aq: z.optional(z.string()),
  cq: z.optional(z.string()),
  firstResult: z.optional(z.number().check(z.minimum(0))),
  numberOfResults: z.optional(z.number().check(z.minimum(0))),
  sortCriteria: z.optional(z.string()),
  f: z.optional(z.record(z.string(), z.array(z.string()))),
  fExcluded: z.optional(z.record(z.string(), z.array(z.string()))),
  cf: z.optional(z.record(z.string(), z.array(z.string()))),
  nf: z.optional(z.record(z.string(), z.unknown())),
  mnf: z.optional(z.record(z.string(), z.unknown())),
  df: z.optional(z.record(z.string(), z.unknown())),
  debug: z.optional(z.boolean()),
  sf: z.optional(z.record(z.string(), z.array(z.string()))),
  tab: z.optional(z.string()),
  af: z.optional(z.record(z.string(), z.array(z.string()))),
});
