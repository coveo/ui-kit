import type {ResultList, ResultListState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common.js';

export const defaultState = {
  firstSearchExecuted: true,
  hasError: false,
  hasResults: true,
  isLoading: false,
  results: [],
  searchResponseId: 'test-search-response-id',
  moreResultsAvailable: false,
} satisfies ResultListState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  fetchMoreResults: vi.fn(),
} satisfies ResultList;

export const buildFakeResultList = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<ResultList>;
  state?: Partial<ResultListState>;
}>): ResultList =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as ResultList;
