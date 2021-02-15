import {Schema, StringValue} from '@coveo/bueno';
import {
  facetSortCriteria,
  FacetSortCriterion,
} from '../../../features/facets/facet-set/interfaces/request';
import {
  BaseFacetOptions,
  BaseFacetSearchOptions,
} from '../_common/base-facet-options';
import {
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
} from '../_common/facet-option-definitions';

export interface FacetOptions extends BaseFacetOptions {
  /**
   * Facet search options.
   */
  facetSearch?: FacetSearchOptions;
  /**
   * The sort criterion to apply to the returned facet values.
   *
   * @default "automatic"
   */
  sortCriteria?: FacetSortCriterion;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FacetSearchOptions extends BaseFacetSearchOptions {}

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  facetSearch,
});
