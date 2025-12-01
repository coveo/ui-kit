import type {
  ProductListing,
  ProductListingState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';
import {buildFakeProduct} from './product';

export const defaultState = {
  responseId: 'some-id',
  products: [buildFakeProduct()],
  isLoading: false,
  error: null,
} satisfies ProductListingState;
export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  refresh: vi.fn(),
  executeFirstRequest: vi.fn(),
  promoteChildToParent: vi.fn(),
  sort: vi.fn(),
  facetGenerator: vi.fn(),
  breadcrumbManager: vi.fn(),
  urlManager: vi.fn(),
  parameterManager: vi.fn(),
  interactiveProduct: vi.fn(),
  pagination: vi.fn(),
  summary: vi.fn(),
} satisfies ProductListing;

export const buildFakeProductListing = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<ProductListing>;
  state?: Partial<ProductListingState>;
}>): ProductListing =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as ProductListing;
