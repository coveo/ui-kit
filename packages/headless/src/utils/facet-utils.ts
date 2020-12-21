export function sortFacets<T extends {facetId: string}>(
  facets: T[],
  sortOrder: string[]
) {
  const payloadMap: Record<string, T> = {};
  facets.forEach((f) => (payloadMap[f.facetId] = f));

  return sortOrder
    .map((id) => payloadMap[id])
    .filter((payload) => payload !== undefined);
}
