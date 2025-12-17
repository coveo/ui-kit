import type {CommerceSuccessResponse} from '../common/response.js';
import type {BaseResult} from '../common/result.js';

export interface ListingCommerceSuccessResponse
  extends CommerceSuccessResponse {
  results: BaseResult[];
}
