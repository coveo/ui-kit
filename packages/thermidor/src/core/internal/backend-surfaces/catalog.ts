/**
 * Commerce A2UI catalog component types that map to stateful, addressable
 * surfaces (as opposed to display-only surfaces stored in the opaque
 * transcript). Kept in sync with the gateway-owned commerce catalog.
 */
export const STATEFUL_SURFACE_COMPONENTS = new Set<string>([
  'ProductSearchSurface',
  'ProductListingSurface',
  'ProductRecommendationsSurface',
]);

const COMPONENT_TO_INTERFACE_TYPE: Record<string, string> = {
  ProductSearchSurface: 'product_search',
  ProductListingSurface: 'product_listing',
  ProductRecommendationsSurface: 'product_recommendations',
};

export function isStatefulSurfaceComponent(component: string): boolean {
  return STATEFUL_SURFACE_COMPONENTS.has(component);
}

export function surfaceTypeFromComponent(component: string): string {
  return COMPONENT_TO_INTERFACE_TYPE[component] ?? component;
}
