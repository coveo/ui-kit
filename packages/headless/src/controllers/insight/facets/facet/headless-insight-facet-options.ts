import {Schema, StringValue} from '@coveo/bueno';
import {facetSortCriteria} from '../../../../features/facets/facet-set/interfaces/request';
import {
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
  allowedValues,
} from '../../../core/facets/_common/facet-option-definitions';
import {
  FacetOptions as CoreFacetOptions,
  FacetSearchOptions,
} from '../../../core/facets/facet/headless-core-facet-options';

export type {FacetSearchOptions};

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
}

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  facetSearch,
  allowedValues,
});
