import {FacetValueState} from './value';

export interface BaseFacetResponse<T> {
  facetId: string;
  field: string;
  moreValuesAvailable: boolean;
  values: T[];
  indexScore: number;
  label?: string;
}

export interface BaseFacetValue {
  state: FacetValueState;
  numberOfResults: number;
}
