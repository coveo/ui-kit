import type {QueryParam} from '../commerce-api-params.js';
import type {BaseCommerceAPIRequest} from '../common/request.js';

export type CommerceSearchRedirectRequest = BaseCommerceAPIRequest &
  QueryParam & {
    debug?: boolean;
    refreshCache?: boolean;
  };
