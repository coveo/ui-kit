import {
  Summary,
  SearchSummaryState,
  ProductListingSummaryState,
} from '@coveo/headless/commerce';

export const defaultState = {
  firstProduct: 0,
  lastProduct: 10,
  firstRequestExecuted: true,
  totalNumberOfProducts: 10,
  hasProducts: true,
  isLoading: false,
  hasError: false,
};
export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
};

export const buildFakeSummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Summary>;
  state?: Partial<SearchSummaryState | ProductListingSummaryState>;
}>): Summary =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as Summary;
