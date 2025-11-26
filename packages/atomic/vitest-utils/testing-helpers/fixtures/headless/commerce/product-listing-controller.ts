import type {
  ProductListing,
  ProductListingState,
} from '@coveo/headless/commerce';
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
