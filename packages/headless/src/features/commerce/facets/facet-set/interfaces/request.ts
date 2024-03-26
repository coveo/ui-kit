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

export type AnyFacetValueRequest =
  | FacetValueRequest
  | CategoryFacetValueRequest
  | NumericRangeRequest
  | DateRangeRequest;

export type AnyFacetRequest = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'preventAutoSelect'
> & {
  displayName: string;
  type: FacetType;
  values: AnyFacetValueRequest[];
  initialNumberOfValues: number;
  numberOfValues?: number;
  delimitingCharacter?: string;
};

export interface CategoryFacetValueRequest extends BaseFacetValueRequest {
  children: CategoryFacetValueRequest[];
  value: string;
  retrieveCount?: number;
}
export type CommerceFacetRequest<T extends AnyFacetValueRequest> = Omit<
  AnyFacetRequest,
  'values'
> & {
  values: T[];
};
