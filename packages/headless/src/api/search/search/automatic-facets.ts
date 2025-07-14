import type {AutomaticFacetResponse} from '../../../features/facets/automatic-facet-set/interfaces/response.js';

export interface AutomaticFacets {
  /**
   * The facets returned by the Automatic Facets feature.
   */
  facets: AutomaticFacetResponse[];
}
