import {ProductListingAPIErrorStatusResponse} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductRecommendation} from '../../api/search/search/product-recommendation';

export type ProductListingState = {
  url: string;
  clientId: string;
  additionalFields: string[];
  advancedParameters: {
    debug: boolean;
  };
  products: ProductRecommendation[];
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
};

export const getProductListingInitialState = (): ProductListingState => ({
  url: '',
  clientId: '',
  additionalFields: [],
  advancedParameters: {
    debug: false,
  },
  products: [],
  error: null,
  isLoading: false,
  responseId: '',
});
