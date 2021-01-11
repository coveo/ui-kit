import {BaseFacetValue, BaseFacetResponse} from '../../facet-api/response';

/**
 * @docsection Interfaces
 */
export interface FacetValue extends BaseFacetValue {
  value: string;
}

export type FacetResponse = BaseFacetResponse<FacetValue>;
