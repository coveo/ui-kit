import {SerializedError} from '@reduxjs/toolkit';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';
import {
  InstantItemsCache,
  InstantItemsState,
} from '../instant-items/instant-items-state';

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
