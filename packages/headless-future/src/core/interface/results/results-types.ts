/**
 * Results Feature Types (Collection)
 *
 * This file defines types for the results collection feature.
 * The individual SearchResult type is owned by the result (singular) concern
 * and re-exported here for backward compatibility.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

import type {SearchResult} from '@/src/core/interface/result/result-types.js';
export type {SearchResult} from '@/src/core/interface/result/result-types.js';

/**
 * Results feature state (collection)
 */
export interface ResultsState {
  /** Array of search results */
  results: SearchResult[];
  /** Whether a search is currently in progress */
  isLoading: boolean;
  /** Error message if search failed */
  error: string | null;
}
