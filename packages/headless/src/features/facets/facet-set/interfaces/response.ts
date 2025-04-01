import {BaseFacetValue, BaseFacetResponse} from '../../facet-api/response.js';

export interface FacetValue extends BaseFacetValue {
  value: string;
}

export type FacetResponse = BaseFacetResponse<FacetValue> & {label?: string};
