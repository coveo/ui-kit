import {Schema, StringValue} from '@coveo/bueno';
import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';
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

type OptionalFacetId = Partial<Pick<FacetRegistrationOptions, 'facetId'>>;

export type FacetOptions = OptionalFacetId &
  Omit<FacetRegistrationOptions, 'facetId'> & {
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
