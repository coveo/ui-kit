export interface FacetInfo {
  facetId: string;
  label: () => string;
  element: HTMLElement;
  isHidden(): boolean;
}
