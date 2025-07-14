import {
  DESIRED_COUNT_DEFAULT,
  NUMBER_OF_VALUE_DEFAULT,
} from './automatic-facet-set-constants.js';
import type {AutomaticFacetResponse} from './interfaces/response.js';

export type AutomaticFacetSlice = {
  response: AutomaticFacetResponse;
};

export type AutomaticFacetSetState = {
  /**
   * The desired count of facets.
   *
   * Minimum: `1`
   * Maximum: `20`
   * @defaultValue `5`
   */
  desiredCount: number;
  /**
   * The desired number of automatically generated facet values.
   *
   * Minimum: `1`
   * @defaultValue `8`
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
