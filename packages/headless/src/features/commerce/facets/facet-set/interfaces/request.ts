import {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
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

export type AnyCommerceFacetRequest = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'preventAutoSelect'
> & {
  displayName: string;
  type: FacetType;
  values: AnyCommerceFacetValueRequest[];
  initialNumberOfValues: number;
  numberOfValues?: number;
};

export interface CommerceCategoryFacetValueRequest
  extends BaseFacetValueRequest {
  children: CommerceCategoryFacetValueRequest[];
  value: string;
  retrieveCount?: number;
}
export type CommerceFacetRequest<T extends AnyCommerceFacetValueRequest> = Omit<
  AnyCommerceFacetRequest,
  'values'
> & {
  values: T[];
};
