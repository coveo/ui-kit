import type {ResultList, ResultListState} from '@coveo/headless';
import {genericSubscribe} from '../common.js';

export const defaultState = {
  firstSearchExecuted: true,
  hasError: false,
  hasResults: true,
  isLoading: false,
  results: [],
  searchResponseId: 'test-search-response-id',
  moreResultsAvailable: false,
};

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
};

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
