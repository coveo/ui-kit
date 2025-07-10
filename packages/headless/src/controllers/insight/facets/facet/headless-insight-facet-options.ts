import {ArrayValue, RecordValue, Schema, StringValue} from '@coveo/bueno';
import {facetResultsMustMatch} from '../../../../features/facets/facet-api/request.js';
import {facetSortCriteria} from '../../../../features/facets/facet-set/interfaces/request.js';
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

export type {FacetSearchOptions, CoreFacetOptions};

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

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  tabs: new RecordValue({
    options: {
      required: false,
    },
    values: {
      included: new ArrayValue({each: new StringValue()}),
      excluded: new ArrayValue({each: new StringValue()}),
    },
  }),
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  resultsMustMatch: new StringValue({constrainTo: facetResultsMustMatch}),
  facetSearch,
  allowedValues,
  customSort,
});
