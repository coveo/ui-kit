export interface CoveoFacetResponse {
  facetId: string;
  field: string;
  values: CoveoFacetValue[];
}

export interface CoveoFacetValue {
  value: string;
  numberOfResults: number;
  state?: 'selected' | 'idle';
}
