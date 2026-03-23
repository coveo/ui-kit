import type {
  ResultList as InsightResultList,
  ResultListState as InsightResultListState,
} from '@coveo/headless/insight';
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
} satisfies InsightResultListState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  fetchMoreResults: vi.fn(),
} satisfies InsightResultList;

export const buildFakeInsightResultList = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<InsightResultList>;
  state?: Partial<InsightResultListState>;
}>): InsightResultList =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as InsightResultList;
