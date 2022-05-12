import {SerializedError} from '@reduxjs/toolkit';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../case-assist.index';

export type InstantResultCache = {
  isLoading: boolean;
  error: SearchAPIErrorWithStatusCode | SerializedError | null;
  results: Result[];
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
