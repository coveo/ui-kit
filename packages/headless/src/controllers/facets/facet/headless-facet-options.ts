import {Schema, StringValue} from '@coveo/bueno';
import {FacetSearchRequestOptions} from '../../../features/facets/facet-search-set/facet-search-request-options';
import {FacetRegistrationOptions} from '../../../features/facets/facet-set/interfaces/options';
import {facetSortCriteria} from '../../../features/facets/facet-set/interfaces/request';
import {
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
} from '../_common/facet-option-definitions';

export type FacetOptions = Omit<FacetRegistrationOptions, 'facetId'> & {
  facetId?: string;
  facetSearch?: Partial<FacetSearchRequestOptions>;
};

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  /** The sort criterion to use for this facet. */
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  facetSearch,
});
