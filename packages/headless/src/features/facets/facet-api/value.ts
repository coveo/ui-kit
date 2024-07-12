export const facetValueStates: FacetValueState[] = [
  'idle',
  'selected',
  'excluded',
];

/**
 * @group Core types and interfaces
 * @category Facets
 */
export type FacetValueState = 'idle' | 'selected' | 'excluded';
