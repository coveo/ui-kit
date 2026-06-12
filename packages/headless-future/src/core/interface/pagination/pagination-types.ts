/**
 * Pagination Feature Types
 *
 * This file defines types for the pagination feature.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

/**
 * Pagination feature state
 */
export interface PaginationState {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Number of results per page */
  pageSize: number;
  /** Total number of results across all pages */
  totalCount: number;
}
