export type AutomaticFacetsState = {
  /**
   * The desired count of facets.
   * The default value is 0.
   */
  desiredCount: number;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 0,
  };
}
