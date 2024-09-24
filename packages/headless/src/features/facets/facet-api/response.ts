import {FacetValueState} from './value.js';

export interface BaseFacetResponse<T> {
  facetId: string;
  field: string;
  moreValuesAvailable: boolean;
  values: T[];
  indexScore: number;
}

export interface BaseFacetValue {
  state: FacetValueState;
  numberOfResults: number;
}
