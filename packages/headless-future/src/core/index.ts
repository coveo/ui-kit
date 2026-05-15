export {
  Engine,
  type FullEngine,
  getFullEngine,
} from './interface/engine/engine.js';
export type {EngineOptions} from './interface/engine/engine-types.js';
export type {
  NavigatorContext,
  NavigatorContextProvider,
} from './interface/navigator-context/navigator-context-types.js';

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

export * as searchBoxMutators from './interface/search-box/search-box-mutators.js';

export * as searchBoxSelectors from './interface/search-box/search-box-selectors.js';

export {loadSearchBox} from './interface/search-box/search-box-loader.js';

// ============================================================================
// Results Feature (Collection — result list data)
// ============================================================================

export type {
  ResultListState as ResultsState,
  SearchResult,
} from './interface/result-list/result-list-types.js';

export * as resultsMutations from './interface/result-list/result-list-mutators.js';

export * as resultsSelectors from './interface/result-list/result-list-selectors.js';

// ============================================================================
// Search API Feature (request status, error, configuration)
// ============================================================================

export type {
  SearchApiState,
  SearchApiStatus,
} from './interface/api/search-api/search-api-types.js';

export * as searchApiMutators from './interface/api/search-api/search-api-mutators.js';

export * as searchApiSelectors from './interface/api/search-api/search-api-selectors.js';

export {loadSearchEndpoint} from './interface/api/search-api/search-endpoint-loader.js';

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
