export type AnyFacetSlice = {enabled: boolean};

export type AnyFacetSetState = Record<string, AnyFacetSlice>;

export function getAnyFacetSliceInitialState(): AnyFacetSlice {
  return {enabled: true};
}

export function getAnyFacetSetInitialState(): AnyFacetSetState {
  return {};
}
