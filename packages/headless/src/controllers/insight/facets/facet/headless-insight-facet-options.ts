import {z} from '@coveo/bueno/zod';
import {
  type FacetResultsMustMatch,
  facetResultsMustMatch,
} from '../../../../features/facets/facet-api/request.js';
import {
  type FacetSortCriterion,
  facetSortCriteria,
} from '../../../../features/facets/facet-set/interfaces/request.js';
import {
  allowedValues,
  customSort,
  facetId,
  facetSearch,
  field,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../../core/facets/_common/facet-option-definitions.js';
import type {
  FacetOptions as CoreFacetOptions,
  FacetSearchOptions,
} from '../../../core/facets/facet/headless-core-facet-options.js';

export type {CoreFacetOptions, FacetSearchOptions};

export interface FacetOptions extends CoreFacetOptions {
  /**
   * Specifies an explicit list of `allowedValues` in the Search API request.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   *
   * The maximum amount of allowed values is 25.
   *
   * Default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  allowedValues?: string[];
  /**
   * Identifies the facet values that must appear at the top, in this order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  customSort?: string[];
}

export const facetOptionsSchema = z.object({
  facetId,
  field,
  tabs: z.optional(
    z.object({
      included: z.optional(z.array(z.string())),
      excluded: z.optional(z.array(z.string())),
    })
  ),
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: z.optional(
    z.enum(facetSortCriteria as [FacetSortCriterion, ...FacetSortCriterion[]])
  ),
  resultsMustMatch: z.optional(
    z.enum(
      facetResultsMustMatch as [
        FacetResultsMustMatch,
        ...FacetResultsMustMatch[],
      ]
    )
  ),
  facetSearch,
  allowedValues,
  customSort,
});
