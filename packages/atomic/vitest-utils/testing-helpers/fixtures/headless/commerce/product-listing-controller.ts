import {ProductListing, ProductListingState} from '@coveo/headless/commerce';

export const defaultState = {
  responseId: 'some-id',
  products: [{}],
  isLoading: false,
  error: null,
};
export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
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
