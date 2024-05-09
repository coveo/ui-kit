import {
  DateRangeRequest,
  NumericRangeRequest,
} from '../../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
import {BaseFacetValueRequest} from '../../../../facets/facet-api/request';
import {
  FacetRequest,
  FacetValueRequest,
} from '../../../../facets/facet-set/interfaces/request';
import {
  CategoryFacetDelimitingCharacter,
  FacetType,
  NumericFacetExtraProperties,
} from './common';

export type CategoryFacetRequest = BaseCommerceFacetRequest<
  CategoryFacetValueRequest,
  'hierarchical'
> &
  CategoryFacetDelimitingCharacter;

export interface CategoryFacetValueRequest extends BaseFacetValueRequest {
  children: CategoryFacetValueRequest[];
  value: string;
  retrieveCount?: number;
}

export type DateFacetRequest = BaseCommerceFacetRequest<
  DateRangeRequest,
  'dateRange'
>;

export type NumericFacetRequest = BaseCommerceFacetRequest<
  NumericRangeRequest,
  'numericalRange'
> &
  NumericFacetExtraProperties;

export type RegularFacetRequest = BaseCommerceFacetRequest<
  FacetValueRequest,
  'regular'
>;

export type BaseCommerceFacetRequest<Value, Type extends FacetType> = Pick<
  FacetRequest,
  | 'facetId'
  | 'field'
  | 'numberOfValues'
  | 'isFieldExpanded'
  | 'preventAutoSelect'
> & {
  displayName: string;
  type: Type;
  values: Value[];
  initialNumberOfValues: number;
  numberOfValues?: number;
};

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
} & Partial<CategoryFacetDelimitingCharacter & NumericFacetExtraProperties>;

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
