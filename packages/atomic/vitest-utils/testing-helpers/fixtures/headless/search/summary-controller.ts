import type {QuerySummary, QuerySummaryState} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const defaultState = {
  firstResult: 1,
  lastResult: 10,
  total: 100,
  query: '',
  durationInSeconds: 0.47,
  durationInMilliseconds: 470,
  firstSearchExecuted: true,
  hasResults: true,
  hasError: false,
  isLoading: false,
  hasDuration: true,
  hasQuery: false,
} satisfies QuerySummaryState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies QuerySummary;

export const buildFakeSummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<QuerySummary>;
  state?: Partial<QuerySummaryState>;
}> = {}): QuerySummary =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as QuerySummary;
