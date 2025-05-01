import {ProductListing, ProductListingState} from '@coveo/headless/commerce';
import {genericSubscribe} from '../common';
import {buildFakeProduct} from './product';

export const defaultState: ProductListingState = {
  responseId: 'some-id',
  products: [buildFakeProduct()],
  isLoading: false,
  error: null,
};
export const defaultImplementation: Partial<ProductListing> = {
  subscribe: genericSubscribe,
  state: defaultState,
};

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
    ...(state && {state: {...defaultState, ...state}}),
  }) as ProductListing;
