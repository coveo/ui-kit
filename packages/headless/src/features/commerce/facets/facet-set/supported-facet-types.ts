import type {FacetType} from './interfaces/common.js';

const supportedFacetTypeMap: Record<FacetType, true> = {
  regular: true,
  dateRange: true,
  numericalRange: true,
  hierarchical: true,
};

const supportedFacetTypes: ReadonlySet<string> = new Set(Object.keys(supportedFacetTypeMap));

/**
 * The Commerce API can return facet types that Headless does not support, such as the retired
 * `location` type. Facet responses of those types must be dropped when they are ingested, because
 * downstream controllers only know how to handle the supported types.
 */
export function isSupportedFacetType(type: string): type is FacetType {
  return supportedFacetTypes.has(type);
}
