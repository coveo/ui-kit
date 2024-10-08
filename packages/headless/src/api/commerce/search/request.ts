import {QueryParam} from '../commerce-api-params.js';
import {CommerceAPIRequest} from '../common/request.js';

export type CommerceSearchRequest = CommerceAPIRequest & QueryParam;
