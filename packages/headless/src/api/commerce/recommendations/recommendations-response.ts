import type {BaseCommerceSuccessResponse} from '../common/response.js';

export interface RecommendationsCommerceSuccessResponse
  extends Omit<BaseCommerceSuccessResponse, 'triggers'> {
  headline: string;
}
