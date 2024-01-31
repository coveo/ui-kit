import {BaseFacetResponse} from '../../facet-api/response';
import {FacetValue} from '../../facet-set/interfaces/response';

export type AutomaticFacetResponse = Omit<
  BaseFacetResponse<FacetValue>,
  'facetId'
> & {label: string};
