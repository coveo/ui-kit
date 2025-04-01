export interface AutomaticFacetGeneratorOptions {
  /**
   * The desired count of automatic facets.
   *
   * Minimum: `1`
   * Maximum: `20`
   * @defaultValue `5`
   */
  desiredCount?: number;

  /**
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
