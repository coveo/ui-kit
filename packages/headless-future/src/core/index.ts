/**
 * Layer 0: Core State Module - Public Interface
 *
 * This is the ONLY entry point for Layers 1-3 to access Layer 0.
 *
 * Exports:
 * - Initialization functions (initialize)
 * - Engine type and creation (createEngine)
 * - Library-agnostic state types
 * - Utility functions (createMutation)
 * - Feature-specific mutations and selectors
 *
 * Does NOT export:
 * - Redux store instance
 * - Redux/Immer types
 * - Internal implementation details
 *
 * Note: read(), subscribe(), and mutate() are now methods on the Engine instance
 */

// ============================================================================
// Engine Type
// ============================================================================

export {Engine} from './interface/engine/engine.js';

// ============================================================================
// Shared Types
// ============================================================================

export type {
  // Root state
  State,

  // Library-agnostic primitives
  StateSelector,
  StateMutation,
  Unsubscribe,
  StateChangeCallback,
} from './interface/interface-types.js';

// ============================================================================
// SearchBox Feature
// ============================================================================

export type {SearchBoxState} from './interface/search-box/search-box-types.js';

export * as searchBoxMutations from './interface/search-box/search-box-mutators.js';

export * as searchBoxSelectors from './interface/search-box/search-box-selectors.js';

// ============================================================================
// Result Feature (Singular — individual result types & per-result UI state)
// ============================================================================

export type {
  SearchResult,
  ResultState,
  ResultMapState,
} from './interface/result/result-types.js';

export * as resultMutations from './interface/result/result-mutators.js';

export * as resultSelectors from './interface/result/result-selectors.js';

// ============================================================================
// Results Feature (Collection — result list, loading, error)
// ============================================================================

export type {ResultsState} from './interface/results/results-types.js';

export * as resultsMutations from './interface/results/results-mutators.js';

export * as resultsSelectors from './interface/results/results-selectors.js';

// ============================================================================
// Facets Feature
// ============================================================================

export type {FacetState, FacetValue} from './interface/facets/facets-types.js';

export * as facetMutations from './interface/facets/facets-mutators.js';

export * as facetSelectors from './interface/facets/facets-selectors.js';

// ============================================================================
// Pagination Feature
// ============================================================================

export type {PaginationState} from './interface/pagination/pagination-types.js';

export * as paginationMutations from './interface/pagination/pagination-mutators.js';

export * as paginationSelectors from './interface/pagination/pagination-selectors.js';

// ============================================================================
// Configuration Feature
// ============================================================================

export type {ConfigurationState} from './interface/configuration/configuration-types.js';

export * as configurationMutations from './interface/configuration/configuration-mutators.js';

export * as configurationSelectors from './interface/configuration/configuration-selectors.js';
