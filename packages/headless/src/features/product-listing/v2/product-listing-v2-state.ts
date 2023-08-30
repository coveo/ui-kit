import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ContextParameters} from '../../../api/commerce/commerce-api-params';
import {Mode} from '../../../api/commerce/commerce-api-params';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface ProductListingV2State {
  trackingId: string;
  locale: string;
  mode: Mode;
  clientId: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  context: ContextParameters;
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
