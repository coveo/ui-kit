import type {
  FoldedCollection,
  FoldedResult,
  FoldedResultList,
  FoldedResultListState,
  Result,
} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common.js';
import {buildFakeResult} from './result.js';

export const defaultState = {
  firstSearchExecuted: true,
  hasError: false,
  hasResults: true,
  isLoading: false,
  results: [] as FoldedCollection[],
  searchResponseId: 'test-search-response-id',
  moreResultsAvailable: false,
} satisfies FoldedResultListState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  fetchMoreResults: vi.fn(),
  loadCollection: vi.fn(),
  logShowMoreFoldedResults: vi.fn(),
  logShowLessFoldedResults: vi.fn(),
  findResultById: vi.fn(),
  findResultByCollection: vi.fn(),
} satisfies FoldedResultList;

export const buildFakeFoldedCollection = ({
  result,
  children = [],
  moreResultsAvailable = false,
  isLoadingMoreResults = false,
}: {
  result?: Result;
  children?: FoldedResult[];
  moreResultsAvailable?: boolean;
  isLoadingMoreResults?: boolean;
} = {}): FoldedCollection => ({
  result: result ?? buildFakeResult(),
  children,
  moreResultsAvailable,
  isLoadingMoreResults,
});

export const buildFakeFoldedResultList = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<FoldedResultList>;
  state?: Partial<FoldedResultListState>;
}> = {}): FoldedResultList =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as FoldedResultList;
