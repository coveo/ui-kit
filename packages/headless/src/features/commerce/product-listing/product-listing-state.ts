import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ContextParams} from '../../../api/commerce/commerce-api-params';
import {Pagination} from '../../../api/commerce/product-listings/v2/pagination';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response';
import {SortBy, SortCriterion} from '../../sort/sort';

export interface ProductListingV2State {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
  context: ContextParams;
  pagination: Pagination;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  appliedSort: {
    by: SortBy.Relevance,
  },
  availableSorts: [],
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
