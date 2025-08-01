import type {SerializedError} from '@reduxjs/toolkit';
import type {Result} from '../../api/search/search/result.js';
import type {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import type {
  InstantItemsCache,
  InstantItemsState,
} from '../instant-items/instant-items-state.js';

export interface InstantResultCache extends InstantItemsCache {
  error: SearchAPIErrorWithStatusCode | SerializedError | null;
  results: Result[];
}

export type InstantResultsState = InstantItemsState<
  Record<string, InstantResultCache>
>;

export function getInstantResultsInitialState(): InstantResultsState {
  return {};
}
