import {Product, Search, SearchState} from '@coveo/headless/commerce';
import {genericSubscribe} from '../../common';

export const defaultState: SearchState = {
  responseId: 'some-id',
  products: [{} as Product /** TODO implement fakeProductFactory */],
  isLoading: false,
  error: null,
};
export const defaultImplementation: Partial<Search> = {
  subscribe: genericSubscribe,
  state: defaultState,
};

export const buildFakeSearch = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Search>;
  state?: Partial<SearchState>;
}>): Search =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as Search;
