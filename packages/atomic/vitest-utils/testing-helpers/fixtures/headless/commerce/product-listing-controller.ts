import {
  Product,
  ProductListing,
  ProductListingState,
} from '@coveo/headless/commerce';
import {genericSubscribe} from '../../common';

export const defaultState: ProductListingState = {
  responseId: 'some-id',
  products: [{} as Product /** TODO implement fakeProductFactory */],
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
