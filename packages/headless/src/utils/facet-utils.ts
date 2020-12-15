export function sortFacets<T extends {facetId: string}>(
  facets: T[],
  facetIds: string[]
) {
  const payloadMap: Record<string, T> = {};
  facets.forEach((f) => (payloadMap[f.facetId] = f));

  return facetIds
    .map((id) => payloadMap[id])
    .filter((payload) => payload !== undefined);
}
