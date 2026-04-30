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
} from './interface/types.js';

// ============================================================================
// SearchBox Feature
// ============================================================================

export type {SearchBoxState} from './interface/search-box/types.js';

export * as searchBoxMutations from './interface/search-box/mutate.js';

export * as searchBoxSelectors from './interface/search-box/selectors.js';

// ============================================================================
// Result Feature (Singular — individual result types & per-result UI state)
// ============================================================================

export type {
  SearchResult,
  ResultState,
  ResultMapState,
} from './interface/result/types.js';

export * as resultMutations from './interface/result/mutate.js';

export * as resultSelectors from './interface/result/selectors.js';

// ============================================================================
// Results Feature (Collection — result list, loading, error)
// ============================================================================

export type {ResultsState} from './interface/results/types.js';

export * as resultsMutations from './interface/results/mutate.js';

export * as resultsSelectors from './interface/results/selectors.js';

// ============================================================================
// Facets Feature
// ============================================================================

export type {FacetState, FacetValue} from './interface/facets/types.js';

export * as facetMutations from './interface/facets/mutate.js';

export * as facetSelectors from './interface/facets/selectors.js';

// ============================================================================
// Pagination Feature
// ============================================================================

export type {PaginationState} from './interface/pagination/types.js';

export * as paginationMutations from './interface/pagination/mutate.js';

export * as paginationSelectors from './interface/pagination/selectors.js';

// ============================================================================
// Configuration Feature
// ============================================================================

export type {ConfigurationState} from './interface/configuration/types.js';

export * as configurationMutations from './interface/configuration/mutate.js';

export * as configurationSelectors from './interface/configuration/selectors.js';
