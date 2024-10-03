import {SerializedError} from '@reduxjs/toolkit';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import {Result} from '../../api/search/search/result.js';
import {
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
