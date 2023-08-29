import {ProductListingAPIErrorStatusResponse} from '../../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {Context} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {ModeParam} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface ProductListingV2State {
  trackingId: string;
  locale: string;
  mode: ModeParam;
  clientId: string;
  error: ProductListingAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  context: Context;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  trackingId: '',
  locale: '',
  mode: 'live',
  clientId: '',
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  context: {
    user: {
      userIp: '',
      userAgent: '',
    },
    view: {
      url: '',
    },
    cart: [],
  },
});
