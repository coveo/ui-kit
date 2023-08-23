import {ProductListingV2APIErrorStatusResponse} from '../../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {Context} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {Mode} from '../../../api/commerce/product-listings/v2/product-listing-v2-params';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface ProductListingV2State {
  propertyId: string;
  listingId: string;
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
