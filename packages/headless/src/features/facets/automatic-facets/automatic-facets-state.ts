import {AutomaticFacetResponse} from '../facet-set/interfaces/response';

export type AutomaticFacetsState = {
  /**
   * The desired count of facets to be sent by the API.
   * The default value is 5.
   */
  desiredCount: number;
  /**
   * An array of the received facets responses.
   * It may be undefined if no facets are available.
   */
  facets: AutomaticFacetResponse[] | undefined;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 5,
    facets: [],
  };
}
