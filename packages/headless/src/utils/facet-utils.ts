export function sortFacets<T extends {facetId: string}>(
  facets: T[],
  sortOrder: string[]
) {
  const payloadMap: Record<string, T> = {};
  facets.forEach((f) => (payloadMap[f.facetId] = f));

  const sortedFacets: T[] = [];
  sortOrder.forEach((facetId) => {
    if (facetId in payloadMap) {
      sortedFacets.push(payloadMap[facetId]);
      delete payloadMap[facetId];
    }
  });
  const remainingFacets = Object.values(payloadMap);

  return [...sortedFacets, ...remainingFacets];
}
