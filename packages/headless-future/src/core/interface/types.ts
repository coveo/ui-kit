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

export type {SearchBoxState} from './search-box/types.js';
export type {
  SearchResult,
  ResultState,
  ResultMapState,
} from './result/types.js';
export type {ResultsState} from './results/types.js';
export type {FacetState, FacetValue} from './facets/types.js';
export type {PaginationState} from './pagination/types.js';
export type {ConfigurationState} from './configuration/types.js';

// Import for use in State interface below
import type {SearchBoxState} from './search-box/types.js';
import type {ResultMapState} from './result/types.js';
import type {ResultsState} from './results/types.js';
import type {FacetState} from './facets/types.js';
import type {PaginationState} from './pagination/types.js';
import type {ConfigurationState} from './configuration/types.js';

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
