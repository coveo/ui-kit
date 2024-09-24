import {FacetValueState} from '../../../../facets/facet-api/value.js';
import {
  CategoryFacetDelimitingCharacter,
  FacetType,
  NumericFacetExtraProperties,
} from './common.js';

export type CategoryFacetResponse = BaseFacetResponse<
  CategoryFacetValue,
  'hierarchical'
> &
  CategoryFacetDelimitingCharacter;

export interface CategoryFacetValue extends BaseFacetValue {
  value: string;
  path: string[];
  isLeafValue: boolean;
  children: CategoryFacetValue[];
}

export type DateFacetResponse = BaseFacetResponse<DateFacetValue, 'dateRange'>;

export type DateFacetValue = RangeFacetValue<string>;

export type NumericFacetResponse = BaseFacetResponse<
  NumericFacetValue,
  'numericalRange'
> &
  NumericFacetExtraProperties;

export type NumericFacetValue = RangeFacetValue<number>;

export type RegularFacetResponse = BaseFacetResponse<
  RegularFacetValue,
  'regular'
>;

export interface RegularFacetValue extends BaseFacetValue {
  value: string;
}

export interface RangeFacetValue<T> extends BaseFacetValue {
  start: T;
  end: T;
  endInclusive: boolean;
}

export interface BaseFacetResponse<
  Value extends BaseFacetValue,
  Type extends FacetType,
> {
  facetId: string;
  field: string;
  displayName: string;
  isFieldExpanded: boolean;
  moreValuesAvailable: boolean;
  fromAutoSelect: boolean;
  values: Value[];
  type: Type;
  numberOfValues: number;
}

export interface BaseFacetValue {
  state: FacetValueState;
  numberOfResults: number;
  isAutoSelected: boolean;
  isSuggested: boolean;
  moreValuesAvailable: boolean;
}

export type AnyFacetValueResponse =
  | RegularFacetValue
  | NumericFacetValue
  | DateFacetValue
  | CategoryFacetValue;

type MappedFacetResponse = {
  [T in FacetType]: T extends 'numericalRange'
    ? NumericFacetResponse
    : T extends 'regular'
      ? RegularFacetResponse
      : T extends 'dateRange'
        ? DateFacetResponse
        : T extends 'hierarchical'
          ? CategoryFacetResponse
          : never;
};

export type AnyFacetResponse = MappedFacetResponse[FacetType];
