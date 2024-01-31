import {SerializedError} from '@reduxjs/toolkit';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';

export type InstantResultCache = {
  expiresAt: number;
  isLoading: boolean;
  error: SearchAPIErrorWithStatusCode | SerializedError | null;
  results: Result[];
  isActive: boolean;
  searchUid: string;
  totalCountFiltered: number;
  duration: number;
};

export type InstantResultsState = Record<
  string,
  {
    /**
     * The basic query expression (e.g., `acme tornado seeds`).
     */
    q: string;
    /**
     * The cache of instant results for each query previously requested.
     */
    cache: Record<string, InstantResultCache>;
  }
>;

export function getInstantResultsInitialState(): InstantResultsState {
  return {};
}

export function hasExpired(cached: InstantResultCache | undefined) {
  if (!cached) {
    return false;
  }
  return cached.expiresAt && Date.now() >= cached.expiresAt;
}
