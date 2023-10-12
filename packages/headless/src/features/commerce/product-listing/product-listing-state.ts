import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation.js';
import {AnyFacetResponse} from '../../facets/generic/interfaces/generic-facet-response.js';
import {buildRelevanceSortCriterion} from '../../sort/sort.js';
import {Sort} from './sort/product-listing-sort.js';

export interface ProductListingV2State {
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  products: ProductRecommendation[];
  facets: AnyFacetResponse[];
  sort: Sort;
}

export const getProductListingV2InitialState = (): ProductListingV2State => ({
  error: null,
  isLoading: false,
  responseId: '',
  products: [],
  facets: [],
  sort: {
    appliedSort: buildRelevanceSortCriterion(),
    availableSorts: [],
  },
});
