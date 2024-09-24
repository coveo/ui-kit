import {Correction} from '../../search/search/query-corrections.js';
import {CommerceSuccessResponse} from '../common/response.js';

export interface SearchCommerceSuccessResponse extends CommerceSuccessResponse {
  queryCorrection?: Correction;
}
