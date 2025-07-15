import type {BaseFacetResponse} from '../../facet-api/response.js';
import type {FacetValue} from '../../facet-set/interfaces/response.js';

export type AutomaticFacetResponse = Omit<
  BaseFacetResponse<FacetValue>,
  'facetId'
> & {label: string};
