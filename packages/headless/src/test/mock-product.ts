import {ProductRecommendation} from '../api/search/search/product';

export function buildMockProductRecommendation(
  config: Partial<ProductRecommendation> = {}
): ProductRecommendation {
  return {
    sku: '',
    name: '',
    description: '',
    link: '',
    ...config,
  };
}
