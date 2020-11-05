export type Product = {
  sku: string;
  name: string;
  thumbnailUrl: string;
  link: string;
  price: number;
  promoPrice: number;
  rating: number;
  tags: string[];
  brand: string;
  categories: string[];
  inStock: boolean;
};

export type ProductRecommendation = Product;
