import type {FacetValueState} from '../../../../facets/facet-api/value.js';
import type {
  CategoryFacetDelimitingCharacter,
  FacetType,
  NumericFacetExtraProperties,
} from './common.js';

export type CategoryFacetResponse = BaseFacetResponse<
  CategoryFacetValue,
  'hierarchical'
> &
  CategoryFacetDelimitingCharacter;

interface NonLocationFacetValue {
  numberOfResults: number;
  isAutoSelected: boolean;
  isSuggested: boolean;
}

export interface CategoryFacetValue
  extends BaseFacetValue,
    NonLocationFacetValue {
  value: string;
  path: string[];
  isLeafValue: boolean;
  children: CategoryFacetValue[];
  moreValuesAvailable: boolean;
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

export interface RegularFacetValue
  extends BaseFacetValue,
    NonLocationFacetValue {
  value: string;
  /**
   * @deprecated Use the facet's `moreValuesAvailable` property instead.
   */
  moreValuesAvailable: boolean;
}

export type LocationFacetResponse = BaseFacetResponse<
  LocationFacetValue,
  'location'
>;

export interface LocationFacetValue extends BaseFacetValue {
  value: string;
}

interface RangeFacetValue<T> extends BaseFacetValue, NonLocationFacetValue {
  start: T;
  end: T;
  endInclusive: boolean;
  /**
   * @deprecated Use the facet's `moreValuesAvailable` property instead.
   */
  moreValuesAvailable: boolean;
}

interface BaseFacetResponse<
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
}

export type AnyFacetValueResponse =
  | RegularFacetValue
  | LocationFacetValue
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
          : T extends 'location'
            ? LocationFacetResponse
            : never;
};

export type AnyFacetResponse = MappedFacetResponse[FacetType];
