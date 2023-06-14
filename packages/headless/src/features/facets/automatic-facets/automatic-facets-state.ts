export type AutomaticFacetsState = {
  /**
   * The desired count of facets.
   *
   * @defaultValue 0
   */
  desiredCount: number;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 0,
  };
}
