export type AutomaticFacetsState = {
  /**
   * The desired count of facets.
   * Must be a positive integer.
   */
  desiredCount: number;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 1,
  };
}
