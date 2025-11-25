import type {CommerceSuccessResponse} from '../common/response.js';
import type {BaseResult} from '../common/result.js';

export interface ListingCommerceSuccessResponse
  extends Omit<CommerceSuccessResponse, 'products'> {
  results: BaseResult[];
}
