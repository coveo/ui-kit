import {ProductRecommendation} from '../api/search/search/product-recommendation.js';

export function buildMockProductRecommendation(
  config: Partial<ProductRecommendation> = {}
): ProductRecommendation {
  return {
    documentUri: '',
    documentUriHash: '',
    permanentid: '',
    clickUri: '',
    ec_name: '',
    additionalFields: {},
    childResults: [],
    totalNumberOfChildResults: 0,
    ...config,
  };
}
