import {ProductRecommendation} from '../api/search/search/product';

export function buildMockProductRecommendation(
  config: Partial<ProductRecommendation> = {}
): ProductRecommendation {
  return {
    name: '',
    sku: '',
    price: 100,
    promoPrice: 50,
    rating: 5,
    tags: [],
    thumbnailUrl: '',
    link: '',
    brand: '',
    categories: [],
    inStock: true,
    ...config,
  };
}
