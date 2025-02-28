import {QueryParam} from '../commerce-api-params.js';
import {FilterableCommerceAPIRequest} from '../common/request.js';

export type CommerceSearchRequest = FilterableCommerceAPIRequest & QueryParam;
