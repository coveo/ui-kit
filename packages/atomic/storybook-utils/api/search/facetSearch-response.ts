export interface FacetSearchValue {
  displayValue: string;
  rawValue: string;
  count: number;
}

export interface FacetSearchResponse {
  values: FacetSearchValue[];
  moreValuesAvailable: boolean;
}

export const baseResponse: FacetSearchResponse = {
  values: [],
  moreValuesAvailable: false,
};
