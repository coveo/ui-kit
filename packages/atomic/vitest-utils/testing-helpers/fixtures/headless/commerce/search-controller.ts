import type {Search, SearchState} from '@coveo/headless/commerce';
import {genericSubscribe} from '../common';

export const defaultState = {
  responseId: 'some-id',
  products: [{}],
  isLoading: false,
  error: null,
};
export const defaultImplementation = {
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
