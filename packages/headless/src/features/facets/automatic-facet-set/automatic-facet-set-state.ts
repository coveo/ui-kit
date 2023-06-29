import {AutomaticFacetResponse} from './interfaces/response';

export type AutomaticFacetsSetState = {
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

export function getAutomaticFacetsSetInitialState(): AutomaticFacetsSetState {
  return {
    desiredCount: 1,
    facets: {},
  };
}
