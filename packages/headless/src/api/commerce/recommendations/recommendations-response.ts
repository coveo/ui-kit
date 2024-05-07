import {BaseCommerceSuccessResponse} from '../common/response';

export interface RecommendationsCommerceSuccessResponse
  extends Omit<BaseCommerceSuccessResponse, 'triggers'> {
  headline: string;
}
