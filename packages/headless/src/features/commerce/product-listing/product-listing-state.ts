import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ContextParams} from '../../../api/commerce/commerce-api-params';
import {Pagination} from '../../../api/commerce/product-listings/v2/pagination';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';

export interface ProductListingV2State {
  trackingId: string;
  language: string;
  currency: string;
  clientId: string;
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  context: ContextParams;
  pagination: Pagination;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  trackingId: '',
  language: '',
  currency: '',
  clientId: '',
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  context: {
    view: {
      url: '',
    },
  },
  pagination: {
    page: 0,
    perPage: 0,
    totalCount: 0,
    totalPages: 0,
  },
});
