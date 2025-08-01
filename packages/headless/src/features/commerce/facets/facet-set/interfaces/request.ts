import type {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import type {BaseFacetValueRequest} from '../../../../facets/facet-api/request.js';
import type {
  FacetRequest,
  FacetValueRequest,
} from '../../../../facets/facet-set/interfaces/request.js';
import type {
  CategoryFacetDelimitingCharacter,
  FacetType,
  NumericFacetExtraProperties,
} from './common.js';

type FreezableFacetRequestProperties = {
  preventAutoSelect: boolean;
  freezeCurrentValues?: boolean;
};

export type CategoryFacetRequest = BaseCommerceFacetRequest<
  CategoryFacetValueRequest,
  'hierarchical'
> &
  CategoryFacetDelimitingCharacter &
  FreezableFacetRequestProperties & {
    retrieveCount?: number;
  };

export interface CategoryFacetValueRequest extends BaseFacetValueRequest {
  children: CategoryFacetValueRequest[];
  value: string;
}

export type DateFacetRequest = BaseCommerceFacetRequest<
  DateRangeRequest,
  'dateRange'
> &
  FreezableFacetRequestProperties;

export type NumericFacetRequest = BaseCommerceFacetRequest<
  NumericRangeRequest,
  'numericalRange'
> &
  NumericFacetExtraProperties &
  FreezableFacetRequestProperties;

export type RegularFacetRequest = BaseCommerceFacetRequest<
  FacetValueRequest,
  'regular'
> &
  FreezableFacetRequestProperties;

export type LocationFacetValueRequest = FacetValueRequest;

export type LocationFacetRequest = BaseCommerceFacetRequest<
  LocationFacetValueRequest,
  'location'
>;

type BaseCommerceFacetRequest<Value, Type extends FacetType> = Pick<
  FacetRequest,
  'facetId' | 'field' | 'isFieldExpanded'
> & {
  displayName?: string;
  type: Type;
  values: Value[];
  initialNumberOfValues?: number;
  numberOfValues?: number;
};

export type AnyFacetValueRequest =
  | FacetValueRequest
  | LocationFacetValueRequest
  | CategoryFacetValueRequest
  | NumericRangeRequest
  | DateRangeRequest;

export type AnyFacetRequest = BaseCommerceFacetRequest<
  AnyFacetValueRequest,
  FacetType
> &
  Partial<
    CategoryFacetDelimitingCharacter &
      NumericFacetExtraProperties &
      FreezableFacetRequestProperties
  >;
