import type {ResultList, ResultListState} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const defaultState = {
  results: [],
  searchResponseId: 'test-response-id',
  moreResultsAvailable: true,
  hasError: false,
  isLoading: false,
  hasResults: false,
  firstSearchExecuted: false,
} satisfies ResultListState;

export const defaultImplementation = {
  fetchMoreResults: () => {},
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies ResultList;

export const buildFakeResultList = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<ResultList>;
  state?: Partial<ResultListState>;
}> = {}): ResultList =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as ResultList;
