export type FacetOptionsSlice = {
  enabled: boolean;
  tabs?: {included?: string[]; excluded?: string[]};
};

export type FacetOptionsState = {
  freezeFacetOrder: boolean;
  facets: Record<string, FacetOptionsSlice>;
};

export function getFacetOptionsSliceInitialState(): FacetOptionsSlice {
  return {enabled: true, tabs: {}};
}

export function getFacetOptionsInitialState(): FacetOptionsState {
  return {
    freezeFacetOrder: false,
    facets: {},
  };
}
