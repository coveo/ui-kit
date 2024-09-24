import {BaseFacetResponse} from '../../facet-api/response.js';
import {FacetValue} from '../../facet-set/interfaces/response.js';

export type AutomaticFacetResponse = Omit<
  BaseFacetResponse<FacetValue>,
  'facetId'
> & {label: string};
