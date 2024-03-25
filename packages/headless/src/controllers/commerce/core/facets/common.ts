interface FacetBuilders<T> {
  numericalRange: (facetId: string) => T
  dateRange: (facetId: string) => T
  hierarchical: (facetId: string) => T
  regular: (facetId: string) => T
}
export const createFacetFactory = <T> (getType: (facetId: string) => string, builders: FacetBuilders<T>) => (facetId: string) => {
  const type = getType(facetId)
  if (type in builders) {
    return builders[type as keyof FacetBuilders<any>](facetId);
  }

  return builders.regular(facetId);
};
