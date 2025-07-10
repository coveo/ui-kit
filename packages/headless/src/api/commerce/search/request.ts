import type {QueryParam} from '../commerce-api-params.js';
import type {FilterableCommerceAPIRequest} from '../common/request.js';

export type CommerceSearchRequest = FilterableCommerceAPIRequest & QueryParam;
