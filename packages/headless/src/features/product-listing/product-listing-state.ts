import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client.js';
import {ProductRecommendation} from '../../api/search/search/product-recommendation.js';
import {AnyFacetResponse} from '../facets/generic/interfaces/generic-facet-response.js';

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
});
