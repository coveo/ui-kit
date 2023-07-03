import {AutomaticFacetResponse} from './interfaces/response';

export type AutomaticFacetSetState = {
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

export function getAutomaticFacetSetInitialState(): AutomaticFacetSetState {
  return {
    desiredCount: 1,
    facets: {},
  };
}
