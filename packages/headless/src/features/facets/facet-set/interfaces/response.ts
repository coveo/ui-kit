import {BaseFacetValue, BaseFacetResponse} from '../../facet-api/response';

export interface FacetValue extends BaseFacetValue {
  value: string;
}

export type FacetResponse = BaseFacetResponse<FacetValue>;

export type AutomaticFacetResponse = Omit<
  BaseFacetResponse<FacetValue>,
  'facetId'
>;
