import {NUMBER_OF_VALUE_DEFAULT} from '../../../features/facets/automatic-facet-set/automatic-facet-set-constants';

export interface AutomaticFacetGeneratorOptions {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired count of automatic facets.
   * Must be a positive integer.
   *
   * Minimum: `1`
   * Maximum: `10`
   */
  desiredCount: number;

  /**
   * @beta - This prop is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired number of automatically generated facet values.
   * Must be a positive integer.
   *
   * Minimum: `1`
   * @defaultValue `8`
   */
  numberOfValues?: number;
}

export function buildOptions(
  options: AutomaticFacetGeneratorOptions
): AutomaticFacetGeneratorOptions {
  return {
    desiredCount: options.desiredCount,
    numberOfValues: options.numberOfValues ?? NUMBER_OF_VALUE_DEFAULT,
  };
}
