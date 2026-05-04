/**
 * Result Feature Types (Singular)
 *
 * This file defines types for an individual search result and per-result UI state.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

/**
 * Individual search result
 */
export interface SearchResult {
  /** Unique identifier for the result */
  id: string;
  /** Document title */
  title: string;
  /** Document URI */
  uri: string;
  /** Excerpt/snippet */
  excerpt: string;
}

/**
 * Per-result ephemeral UI state
 */
export interface ResultState {
  /** Whether the result is selected */
  isSelected: boolean;
  /** Whether the result details are expanded */
  isExpanded: boolean;
}

/**
 * Map of result IDs to their UI state
 */
export type ResultMapState = Record<string, ResultState>;
