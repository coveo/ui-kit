export interface FacetSearchSuccessResponse {
  values: FacetSearchValue[];
  moreValuesAvailable: boolean;
}

export interface FacetSearchValue {
  displayValue: string;
  rawValue: string;
  count: number;
}
