import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';
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
  listingId: string;
  locale: string; // TODO(nico): action for setting this
  mode: string; // TODO(nico): action for setting this
  clientId: string;
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  version: string;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  listingId: '',
  locale: '',
  mode: '',
  clientId: '',
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  version: 'v2'
});
