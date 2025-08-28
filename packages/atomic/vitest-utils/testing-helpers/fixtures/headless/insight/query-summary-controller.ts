import type {QuerySummary, QuerySummaryState} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

export const defaultQuerySummaryState: QuerySummaryState = {
  query: '',
  hasQuery: false,
  hasResults: false,
  firstResult: 0,
  lastResult: 0,
  total: 0,
  hasDuration: false,
  durationInMilliseconds: 0,
  durationInSeconds: 0,
  hasError: false,
  isLoading: false,
  firstSearchExecuted: false,
};

export const defaultQuerySummaryImplementation = {
  subscribe: genericSubscribe,
  state: defaultQuerySummaryState,
};

export const buildFakeQuerySummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<QuerySummary>;
  state?: Partial<QuerySummaryState>;
}> = {}): QuerySummary =>
  ({
    ...defaultQuerySummaryImplementation,
    ...implementation,
    ...(state && {state: {...defaultQuerySummaryState, ...state}}),
  }) as QuerySummary;
