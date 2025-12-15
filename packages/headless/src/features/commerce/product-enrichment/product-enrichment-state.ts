import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {BadgesProduct} from '../../../api/commerce/product-enrichment/product-enrichment-response.js';

export interface ProductEnrichmentState {
  /**
   * The array of products containing badge placements for each product.
   */
  products: BadgesProduct[];
  /**
   * Whether a request to fetch badges is currently being executed.
   */
  isLoading: boolean;
  /**
   * The error message if the request failed.
   */
  error: CommerceAPIErrorStatusResponse | null;
}

export function getProductEnrichmentInitialState(): ProductEnrichmentState {
  return {
    products: [],
    isLoading: false,
    error: null,
  };
}
