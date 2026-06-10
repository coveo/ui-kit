import * as z from '@coveo/bueno/zod';
import {
  buildRelevanceSortCriterion,
  type SortByFields as CoreSortByFields,
  type SortByFieldsFields as CoreSortByFieldsFields,
  SortBy,
  type SortByRelevance,
  SortDirection,
} from '../../sort/sort.js';

export type {SortByRelevance};
export {buildRelevanceSortCriterion, SortBy, SortDirection};

export type SortByFields = Pick<CoreSortByFields, 'by'> & {
  fields: SortByFieldsFields[];
};

export type SortByFieldsFields = CoreSortByFieldsFields & {
  displayName?: string;
};

export type SortCriterion = SortByRelevance | SortByFields;

/**
 * Builds a field sort criterion.
 *
 * @param fields - An array of fields to sort by.
 * @returns The sort criterion object.
 */
export const buildFieldsSortCriterion = (
  fields: SortByFieldsFields[]
): SortByFields => ({
  by: SortBy.Fields,
  fields,
});

export const sortCriterionDefinition = z.optional(
  z.object({
    by: z.enum(Object.values(SortBy) as [string, ...string[]]),
    fields: z.optional(
      z.array(
        z.object({
          field: z.string(),
          direction: z.optional(
            z.enum(Object.values(SortDirection) as [string, ...string[]])
          ),
          displayName: z.optional(z.string()),
        })
      )
    ),
  })
);
