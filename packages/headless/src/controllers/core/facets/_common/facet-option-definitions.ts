import * as z from '@coveo/bueno/zod';

export const facetId = z.optional(
  z.string().check(z.regex(/^[a-zA-Z0-9-_]+$/))
);
export const field = z.string();
export const basePath = z.optional(z.array(z.string()));

export const delimitingCharacter = z.optional(z.string());
export const filterByBasePath = z.optional(z.boolean());
export const filterFacetCount = z.optional(z.boolean());
export const injectionDepth = z.optional(z.number().check(z.minimum(0)));
export const numberOfValues = z.optional(z.number().check(z.minimum(1)));
export const generateAutomaticRanges = z.boolean() as never;

const facetSearchOptionDefinitions = z.object({
  captions: z.optional(z.record(z.string(), z.string())),
  numberOfValues: z.optional(z.number().check(z.minimum(1))),
  query: z.optional(z.string()),
});

export const facetSearch = z.optional(facetSearchOptionDefinitions);

export const allowedValues = z.optional(
  z.object({
    type: z.enum(['simple']),
    values: z.array(z.string().check(z.minLength(1))).check(z.maxLength(25)),
  })
);

export const hasBreadcrumbs = z.optional(z.boolean());

export const customSort = z.optional(
  z
    .array(z.string().check(z.minLength(1)))
    .check(z.minLength(1), z.maxLength(25))
);
