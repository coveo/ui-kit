export {
  Engine,
  type FullEngine,
  getFullEngine,
} from '@/src/core/interface/engine/engine.js';
export {getSampleEngineConfiguration} from '@/src/core/interface/engine/engine-configuration.js';
export type {
  NavigatorContext,
  NavigatorContextProvider,
} from './interface/navigator-context/navigator-context-types.js';

export type {
  EngineOptions,
  Unsubscribe,
} from '@/src/core/interface/engine/engine-types.js';

export {createMemoizedStateSelector} from './interface/utils/memoized-state-selector.js';

// ============================================================================
// SearchBox Feature
// ============================================================================

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

export {loadResultList} from './interface/result-list/result-list-loader.js';

// ============================================================================
// Search API Feature (request status, error, configuration)
// ============================================================================

export type {
  SearchEndpointState,
  SearchEndpointStatus,
} from './interface/api/search-endpoint/search-endpoint-types.js';

export * as searchEndpointMutators from './interface/api/search-endpoint/search-endpoint-mutators.js';

export * as searchEndpointSelectors from './interface/api/search-endpoint/search-endpoint-selectors.js';

export {loadSearchEndpoint} from './interface/api/search-endpoint/search-endpoint-loader.js';

export {SearchEndpointFacade} from './interface/api/search-endpoint/search-endpoint-facade.js';

export {ConversationRuntime} from './interface/api/conversation-endpoint/conversation-runtime.js';

// ============================================================================
// Conversation Feature
// ============================================================================

export type {
  ConversationMessage,
  ConversationSession,
  ConversationState,
  ConversationStreaming,
  ConversationTurn,
} from './interface/conversation/conversation-types.js';

export * as conversationMutators from './interface/conversation/conversation-mutators.js';

export * as conversationSelectors from './interface/conversation/conversation-selectors.js';

export {loadConversation} from './interface/conversation/conversation-loader.js';

export * as conversationEndpointMutators from './interface/api/conversation-endpoint/conversation-endpoint-mutators.js';

export * as conversationEndpointSelectors from './interface/api/conversation-endpoint/conversation-endpoint-selectors.js';

export {loadConversationEndpoint} from './interface/api/conversation-endpoint/conversation-endpoint-loader.js';
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
