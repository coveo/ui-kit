export type CommerceApiMethod =
  | 'listing'
  | 'search'
  | 'recommendations'
  | 'search/productSuggest'
  | 'search/querySuggest'
  | 'querySuggest'
  | 'facet'
  | 'badges';

/**
 * API methods that require the tracking ID to be included in the URL path.
 * These endpoints use the pattern: /tracking-ids/{trackingId}/{method}
 * All other endpoints use: /{method}
 */
export const TRACKING_ID_IN_PATH_METHODS: readonly CommerceApiMethod[] = [
  'badges',
] as const;
