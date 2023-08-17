export interface AutomaticFacetGeneratorOptions {
  /**
   * @beta - This property is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired count of automatic facets.
   *
   * Minimum: `1`
   * Maximum: `10`
   * @defaultValue `5`
   */
  desiredCount?: number;

  /**
   * @beta - This prop is part of the automatic facets feature.
   * Automatic facets are currently in beta testing and should be available soon.
   *
   * The desired number of automatically generated facet values.
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
    numberOfValues: options.numberOfValues,
  };
}
