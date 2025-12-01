import type {Search, SearchState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
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
  executeFirstSearch: vi.fn(),
  promoteChildToParent: vi.fn(),
  didYouMean: vi.fn(),
  sort: vi.fn(),
  facetGenerator: vi.fn(),
  breadcrumbManager: vi.fn(),
  urlManager: vi.fn(),
  parameterManager: vi.fn(),
  interactiveProduct: vi.fn(),
  pagination: vi.fn(),
  summary: vi.fn(),
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
