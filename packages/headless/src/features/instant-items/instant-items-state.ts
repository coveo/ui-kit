export interface InstantItemsCache {
  expiresAt: number;
  isLoading: boolean;
  isActive: boolean;
  searchUid: string;
  totalCountFiltered: number;
  duration: number;
}

export type InstantItemsState<Cache> = Record<
  string,
  {
    /**
     * The basic query expression (for example, `acme tornado seeds`).
     */
    q: string;
    /**
     * The cache of instant items for each query previously requested.
     */
    cache: Cache;
  }
>;

export function hasExpired(cached: InstantItemsCache | undefined) {
  if (!cached) {
    return false;
  }
  return cached.expiresAt && Date.now() >= cached.expiresAt;
}
