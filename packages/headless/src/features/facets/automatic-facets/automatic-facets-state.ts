import {FacetResponse} from '../facet-set/interfaces/response';

export type AutomaticFacetsState = {
  /**
   * The desired count of facets.
   * The default value is 0.
   */
  desiredCount: number;
  /**
   * The current automatic facets in the state.
   */
  currentFacets: FacetResponse[];
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 0,
    currentFacets: [],
  };
}
