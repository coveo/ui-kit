import {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../../../product-listing.index';
import {BaseFacetValueRequest} from '../../../../facets/facet-api/request';
import {
  FacetRequest,
  FacetValueRequest,
} from '../../../../facets/facet-set/interfaces/request';
import {FacetType} from './response';

export type AnyCommerceFacetValueRequest =
  | FacetValueRequest
  | CommerceCategoryFacetValueRequest
  | NumericRangeRequest
  | DateRangeRequest;

export type CommerceFacetRequest = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'preventAutoSelect'
> & {
  type: FacetType;
  values: AnyCommerceFacetValueRequest[];
  initialNumberOfValues: number;
};

export interface CommerceCategoryFacetValueRequest
  extends BaseFacetValueRequest {
  children: CommerceCategoryFacetValueRequest[];
  value: string;
}
