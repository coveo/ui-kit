import type {EnableResultsParam} from '../commerce-api-params.js';
import type {FilterableCommerceAPIRequest} from '../common/request.js';

export type CommerceListingRequest = FilterableCommerceAPIRequest &
  EnableResultsParam;
