/**
 * Facets Feature Types
 *
 * This file defines types for the facets feature.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export interface FacetsState {
  [facetId: string]: FacetState;
}

/**
 * Facet feature state
 */
export interface FacetState {
  /** Facet unique identifier */
  id: string;
  /** Display label for the facet */
  label: string;
  /** Available facet values */
  values: FacetValue[];
  /** Currently selected value IDs */
  selectedValues: string[];
}

/**
 * Individual facet value
 */
export interface FacetValue {
  /** Unique identifier for the value */
  id: string;
  /** Display label */
  label: string;
  /** Number of results with this value */
  count: number;
}
