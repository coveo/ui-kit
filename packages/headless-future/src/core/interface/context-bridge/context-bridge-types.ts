/**
 * ContextBridge Feature Types
 *
 * Bidirectional bridge state between search/discovery and conversation context.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

export type CitationLink = {
  id: string;
  turnId: string;
};

export interface ContextBridgeState {
  /** Products/content IDs selected from search results */
  selectedProducts: string[];
  /** The current search query context shared with conversation */
  activeQuery?: string;
  /** Active facet filters shared with conversation */
  activeFilters: Record<string, string[]>;
  /** Citations surfaced by the assistant and correlated back to search */
  citations: CitationLink[];
}
