export type FacetOptionsSlice = {enabled: boolean};

export type FacetOptionsState = {
  freezeFacetOrder: boolean;
  facets: Record<string, FacetOptionsSlice>;
};

export function getFacetOptionsSliceInitialState(): FacetOptionsSlice {
  return {enabled: true};
}

export function getFacetOptionsInitialState(): FacetOptionsState {
  return {
    freezeFacetOrder: false,
    facets: {},
  };
}
