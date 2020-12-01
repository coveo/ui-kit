export const facetValueStates = ['idle', 'selected'] as const;
export type FacetValueState = typeof facetValueStates[number];
