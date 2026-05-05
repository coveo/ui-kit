/**
 * Layer 0 Interface: Shared State Types
 *
 * This file defines the root state structure and library-agnostic primitives.
 * Feature-specific types are re-exported from their respective feature directories.
 *
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 * All types must be pure TypeScript.
 */

// ============================================================================
// Feature State Type Re-exports
// ============================================================================

export type {SearchBoxState} from './search-box/search-box-types.js';
export type {
  SearchResult,
  ResultState,
  ResultMapState,
} from './result/result-types.js';
export type {ResultsState} from './results/results-types.js';
export type {FacetState, FacetValue} from './facets/facets-types.js';
export type {PaginationState} from './pagination/pagination-types.js';
export type {ConfigurationState} from './configuration/configuration-types.js';
export type {
  ConversationState,
  ConversationMessage,
  ConversationTurn,
  ConversationSession,
  ConversationMessageRole,
  TurnStatus,
  CitationRef,
  ToolState,
  ConversationWarningCode,
  ConversationErrorSource,
  StructuredConversationError,
} from './conversation/conversation-types.js';
export type {StreamingState, StreamError} from './streaming/streaming-types.js';
export type {
  OrchestrationState,
  OrchestrationSnapshot,
  OrchestrationMode,
} from './orchestration/orchestration-types.js';
export type {
  SurfacesState,
  StructuredSurface,
} from './surfaces/surfaces-types.js';
export type {
  SharedContextState,
  CitationLink,
} from './shared-context/shared-context-types.js';

// Import for use in State interface below
import type {SearchBoxState} from './search-box/search-box-types.js';
import type {ResultMapState} from './result/result-types.js';
import type {ResultsState} from './results/results-types.js';
import type {FacetState} from './facets/facets-types.js';
import type {PaginationState} from './pagination/pagination-types.js';
import type {ConfigurationState} from './configuration/configuration-types.js';
import type {ConversationState} from './conversation/conversation-types.js';
import type {StreamingState} from './streaming/streaming-types.js';
import type {OrchestrationState} from './orchestration/orchestration-types.js';
import type {SurfacesState} from './surfaces/surfaces-types.js';
import type {SharedContextState} from './shared-context/shared-context-types.js';

// ============================================================================
// Root State Interface
// ============================================================================

/**
 * Root application state structure
 *
 * All properties are optional because slices are adopted dynamically
 * as needed by upper layers.
 */
export interface State {
  /** SearchBox state (available after adoption) */
  searchBox?: SearchBoxState;
  /** Per-result UI state (available after adoption) */
  result?: ResultMapState;
  /** Results collection state (available after adoption) */
  results?: ResultsState;
  /** Facets by ID (map structure, available after adoption) */
  facets?: Record<string, FacetState>;
  /** Pagination state (available after adoption) */
  pagination?: PaginationState;
  /** Configuration state (available after adoption) */
  configuration?: ConfigurationState;
  /** Conversation domain: messages, turns, session continuity */
  conversation?: ConversationState;
  /** Streaming domain: SSE connection status and telemetry */
  streaming?: StreamingState;
  /** Orchestration domain: backend-driven mode/phase transitions */
  orchestration?: OrchestrationState;
  /** Surfaces domain: normalized structured UI surfaces */
  surfaces?: SurfacesState;
  /** SharedContext domain: cross-domain context bridge state */
  sharedContext?: SharedContextState;
}

// ============================================================================
// Library-Agnostic Primitives
// ============================================================================

/**
 * Function that selects a value from state
 *
 * @template T The type of value selected from state
 * @param state The current application state
 * @returns The selected value
 */
export type StateSelector<T> = {
  bivarianceHack(state: State): T;
}['bivarianceHack'];

/**
 * A state mutation object
 *
 * Library-agnostic representation of a state change.
 * Does NOT expose Redux action types.
 */
export interface StateMutation {
  /** Mutation type identifier */
  type: string;
  /** Optional mutation payload */
  payload?: unknown;
}

/**
 * Function to unsubscribe from state changes
 */
export type Unsubscribe = () => void;

/**
 * Callback invoked when subscribed state changes
 *
 * @template T The type of value being observed
 * @param value The new value
 */
export type StateChangeCallback<T> = (value: T) => void;
