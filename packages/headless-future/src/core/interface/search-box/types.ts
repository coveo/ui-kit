/**
 * SearchBox Feature Types
 *
 * This file defines types for the searchBox feature.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

/**
 * SearchBox feature state
 */
export interface SearchBoxState {
  /** Current search query string */
  query: string;
}
