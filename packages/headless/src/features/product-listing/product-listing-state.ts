import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client';
import {Context} from '../../api/commerce/product-listings/product-listing-params';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {Mode} from '../../controllers/product-listing/headless-product-listing';
import {AnyFacetResponse} from '../facets/generic/interfaces/generic-facet-response';

export interface ProductListingState {
  url: string;
  clientId: string;
  additionalFields: string[];
  advancedParameters: {
    debug: boolean;
  };
  products: ProductRecommendation[];
  facets: {
    results: AnyFacetResponse[];
  };
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  version: string;
}

export const getProductListingInitialState = (): ProductListingState => ({
  url: '',
  clientId: '',
  additionalFields: [],
  advancedParameters: {
    debug: false,
  },
  products: [],
  facets: {
    results: [],
  },
  error: null,
  isLoading: false,
  responseId: '',
  version: '',
});

export interface ProductListingV2State {
  propertyId: string;
  listingId: string;
  locale: string; // TODO: action for setting this
  mode: Mode; // TODO: action for setting this
  clientId: string;
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  version: string;
  context: Context;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  propertyId: '',
  listingId: '',
  locale: '',
  mode: Mode.Live,
  clientId: '',
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  version: 'v2',
  context: {
    user: {
      userId: '',
      email: '',
      userIp: '',
      userAgent: '',
    },
    view: {
      url: '',
      referrerUrl: '',
      pageType: '',
    },
    cart: [
      {
        groupId: '',
        productId: '',
        sku: '',
      },
    ],
  },
});
