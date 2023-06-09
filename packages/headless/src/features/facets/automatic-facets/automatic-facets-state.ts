export type AutomaticFacetsState = {
  /**
   * The desired count of facets to be sent by the API.
   * The default value is 5.
   */
  desiredCount: number;
};

export function getAutomaticFacetsInitialState(): AutomaticFacetsState {
  return {
    desiredCount: 5,
  };
}
