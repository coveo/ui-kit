import {FacetRequest} from '../../../../facets/facet-set/interfaces/request';
import {AnyFacetValueRequest} from '../../../../facets/generic/interfaces/generic-facet-request';
import {FacetType} from './response';

export type CommerceFacetRequest = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'preventAutoSelect'
> & {
  type: FacetType;
  values: AnyFacetValueRequest[];
  initialNumberOfValues: number;
};
