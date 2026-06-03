import type {
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {genericSubscribe} from '../common';

type SummaryType = Summary<SearchSummaryState | ProductListingSummaryState>;
type SummaryState = SearchSummaryState | ProductListingSummaryState;

export const defaultState = {
  query: '',
  firstProduct: 1,
  lastProduct: 10,
  firstRequestExecuted: true,
  totalNumberOfProducts: 100,
  hasProducts: true,
  isLoading: false,
  hasError: false,
} satisfies SummaryState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies SummaryType;

export const buildFakeSummary = <T extends SummaryState>({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Summary<T>>;
  state?: Partial<T>;
}> = {}): Summary<T> =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Summary<T>;
