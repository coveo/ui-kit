import {ProductRecommendation} from '../api/search/search/product-recommendation';

export function buildMockProductRecommendation(
  config: Partial<ProductRecommendation> = {}
): ProductRecommendation {
  return {
    permanentid: '',
    clickUri: '',
    ec_name: '',
    additionalFields: {},
    ...config,
  };
}
