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
  | 'preventAutoSelect'
> & {
  type: FacetType;
  values: FacetValueRequest[];
  initialNumberOfValues: number;
};
