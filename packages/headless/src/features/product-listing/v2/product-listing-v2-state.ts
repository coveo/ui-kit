import {ProductListingV2APIErrorStatusResponse} from '../../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {Context} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {Mode} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface ProductListingV2State {
  trackingId: string;
  locale: string; // TODO: action for setting this
  mode: Mode; // TODO: action for setting this
  clientId: string;
  error: ProductListingV2APIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  version: string;
  context: Context;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  trackingId: '',
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
      userIp: '',
      userAgent: '',
    },
    view: {
      url: '',
    },
    cart: [],
  },
});
