import * as z from '@coveo/bueno/zod';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';

export const facetSearchOptionsDefinition = z.object({
  facetId: facetIdDefinition,
  captions: z.optional(z.record(z.string(), z.string())),
  numberOfValues: z.optional(z.number().check(z.minimum(1))),
  query: z.optional(z.string()),
});
