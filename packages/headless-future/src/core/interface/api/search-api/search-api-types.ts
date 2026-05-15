/**
 * The status of the search API facade.
 * - `'idle'`    — no request in flight
 * - `'pending'` — a request is currently being executed
 */
export type SearchApiStatus = 'idle' | 'pending';

/**
 * State stored in the engine by the Search API Facade.
 */
export interface SearchApiState {
  /** Arbitrary configuration record for facade-specific settings. */
  configuration: Record<string, any>;
  /** Whether a search request is currently in flight. */
  status: SearchApiStatus;
  /** Error message from the last failed search request, if any. */
  error: string | null;
}
