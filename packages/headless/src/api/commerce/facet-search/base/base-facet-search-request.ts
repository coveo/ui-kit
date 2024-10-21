export interface FacetSearchType<
  T extends 'specific' | 'location' | 'hierarchical',
> {
  type: T;
}
