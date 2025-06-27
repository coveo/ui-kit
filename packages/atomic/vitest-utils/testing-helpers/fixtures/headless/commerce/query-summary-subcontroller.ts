import {
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';

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
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
};

export const buildFakeQuerySummary = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SummaryType>;
  state?: Partial<SummaryState>;
}> = {}): SummaryType =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as SummaryType;
