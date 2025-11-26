import type {Search, SearchState} from '@coveo/headless/commerce';
import {genericSubscribe} from '../common';
import {buildFakeProduct} from './product';

export const defaultState = {
  responseId: 'some-id',
  products: [buildFakeProduct()],
  isLoading: false,
  error: null,
} satisfies SearchState;
export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies Search;

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
    ...{state: {...defaultState, ...(state || {})}},
  }) as Search;
