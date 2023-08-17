import {
  DESIRED_COUNT_DEFAULT,
  NUMBER_OF_VALUE_DEFAULT,
} from './automatic-facet-set-constants';
import {AutomaticFacetResponse} from './interfaces/response';

export type AutomaticFacetSlice = {
  response: AutomaticFacetResponse;
};

export type AutomaticFacetSetState = {
  /**
   * The desired count of facets.
   * Must be a positive integer.
   */
  desiredCount: number;
  /**
   * The desired number of automatically generated facet values.
   * Must be a positive integer.
   */
  numberOfValues: number;
  /**
   * A map of automatic facet field to an automatic facet slice containing the response.
   */
  set: Record<string, AutomaticFacetSlice>;
};

export function getAutomaticFacetSetInitialState(): AutomaticFacetSetState {
  return {
    desiredCount: DESIRED_COUNT_DEFAULT,
    numberOfValues: NUMBER_OF_VALUE_DEFAULT,
    set: {},
  };
}
