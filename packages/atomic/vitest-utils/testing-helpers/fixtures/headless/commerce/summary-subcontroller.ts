import {SearchSummaryState, Summary} from '@coveo/headless/commerce';
import {genericSubscribe} from '../common';

export const defaultState: SearchSummaryState = {
  firstProduct: 0,
  lastProduct: 3,
  firstRequestExecuted: true,
  hasError: false,
  hasProducts: true,
  isLoading: false,
  query: 'query',
  totalNumberOfProducts: 3,
};

export const defaultImplementation: Partial<Summary> = {
  subscribe: genericSubscribe,
  state: defaultState,
};

export const buildFakeSummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Summary>;
  state?: Partial<SearchSummaryState>;
}> = {}): Summary =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as Summary;
