import {AutomaticFacetResponse} from './interfaces/response';

export type AutomaticFacetsState = {
  /**
   * The desired count of facets.
   * Must be a positive integer.
   */
  desiredCount: number;
  /**
   * TODO
   */
  facets: Record<string, AutomaticFacetResponse>;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 1,
    facets: {},
  };
}
