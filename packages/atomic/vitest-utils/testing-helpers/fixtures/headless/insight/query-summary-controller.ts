import type {QuerySummary, QuerySummaryState} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

const defaultState = {
  firstResult: 1,
  lastResult: 10,
  total: 100,
  query: '',
  durationInSeconds: 0.47,
  durationInMilliseconds: 470,
  hasDuration: true,
  hasQuery: false,
} satisfies QuerySummaryState;

const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies QuerySummary;

export const buildFakeQuerySummary = ({
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
