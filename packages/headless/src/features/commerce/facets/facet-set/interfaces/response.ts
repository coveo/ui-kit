import {FacetValueState} from '../../../../facets/facet-api/value';

export interface BaseFacetResponse<Value, Type extends FacetType> {
  facetId: string;
  field: string;
  displayName: string;
  isFieldExpanded: boolean;
  moreValuesAvailable: boolean;
  fromAutoSelect: boolean;
  values: Value[];
  type: Type;
}

export type FacetResponse = BaseFacetResponse<FacetValue, 'regular'>;
export type DateRangeFacetResponse = BaseFacetResponse<DateFacetValue, 'dateRange'>;
export type NumericalRangeFacetResponse = BaseFacetResponse<NumericFacetValue, 'numericalRange'>;
export type CategoryFacetResponse = BaseFacetResponse<CategoryFacetValue, 'hierarchical'>;
export type FacetType =
  | 'regular'
  | 'dateRange'
  | 'numericalRange'
  | 'hierarchical';

export interface BaseFacetValue {
  state: FacetValueState;
  numberOfResults: number;
  isAutoSelected: boolean;
  isSuggested: boolean;
  moreValuesAvailable: boolean;
}

export interface FacetValue extends BaseFacetValue {
  value: string;
}

export interface RangeFacetValue<T> extends BaseFacetValue {
  start: T;
  end: T;
  endInclusive: boolean;
}

export type DateFacetValue = RangeFacetValue<string>;
export type NumericFacetValue = RangeFacetValue<number>;
export type AnyFacetValue =
  | FacetValue
  | NumericFacetValue
  | DateFacetValue
  | CategoryFacetValue;
export type AnyFacetResponse =
  | FacetResponse
  | DateRangeFacetResponse
  | NumericalRangeFacetResponse
  | CategoryFacetResponse;

export interface CategoryFacetValue extends BaseFacetValue {
  value: string;
  path: string[];
  isLeafValue: boolean;
  children: CategoryFacetValue[];
}
