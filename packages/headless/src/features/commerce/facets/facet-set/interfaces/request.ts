import {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import {BaseFacetValueRequest} from '../../../../facets/facet-api/request.js';
import {
  FacetRequest,
  FacetValueRequest,
} from '../../../../facets/facet-set/interfaces/request.js';
import {
  CategoryFacetDelimitingCharacter,
  FacetType,
  NumericFacetExtraProperties,
} from './common.js';

export type FreezableFacetRequestProperties = {
  preventAutoSelect: boolean;
  freezeCurrentValues?: boolean;
};

export type CategoryFacetRequest = BaseCommerceFacetRequest<
  CategoryFacetValueRequest,
  'hierarchical'
> &
  CategoryFacetDelimitingCharacter &
  FreezableFacetRequestProperties;

export interface CategoryFacetValueRequest extends BaseFacetValueRequest {
  children: CategoryFacetValueRequest[];
  value: string;
  retrieveCount?: number;
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

export type BaseCommerceFacetRequest<Value, Type extends FacetType> = Pick<
  FacetRequest,
  'facetId' | 'field' | 'numberOfValues' | 'isFieldExpanded'
> & {
  displayName?: string;
  type: Type;
  values: Value[];
  initialNumberOfValues: number;
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

type MappedFacetRequest = {
  [T in FacetType]: T extends 'numericalRange'
    ? NumericFacetRequest
    : T extends 'regular'
      ? RegularFacetRequest
      : T extends 'dateRange'
        ? DateFacetRequest
        : T extends 'hierarchical'
          ? CategoryFacetRequest
          : never;
};

export type CommerceFacetRequest = MappedFacetRequest[FacetType];
