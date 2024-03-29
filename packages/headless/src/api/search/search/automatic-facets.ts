import {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response';

export interface AutomaticFacets {
  /**
   * The facets returned by the Automatic Facets feature.
   */
  facets: AutomaticFacetResponse[];
}
