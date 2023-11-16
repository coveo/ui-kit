import {CommerceSuccessResponse} from '../api/commerce/common/response';
import {QueryCommerceAPIThunkReturn} from '../features/commerce/common/actions';
import {buildFetchProductListingV2Response} from './mock-product-listing-v2';

export function buildSearchResponse(
  response: Partial<CommerceSuccessResponse> = {}
): QueryCommerceAPIThunkReturn {
  return buildFetchProductListingV2Response(response);
}
