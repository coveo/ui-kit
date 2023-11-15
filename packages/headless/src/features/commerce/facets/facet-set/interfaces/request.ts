import {
  FacetRequest,
  FacetValueRequest,
} from '../../../../facets/facet-set/interfaces/request';
import {FacetType} from './response';

export type CommerceFacetRequest = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'freezeCurrentValues'
  | 'preventAutoSelect'
> & {
  type: FacetType;
  // TODO(nico): Will need to narrow down FacetValueRequest type
  values: FacetValueRequest[];
};
