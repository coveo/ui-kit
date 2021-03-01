export type Product = {
  /**
   * The SKU of the product.
   */
  sku: string;
  /**
   * Name of the product.
   *
   * From the `ec_name` field.
   */
  name: string;
  /**
   * Description of the product.
   *
   * From the `ec_description` field.
   */
  description: string;
  /**
   * A direct link to the product in URL format.
   */
  link: string;
  /**
   * Product brand.
   *
   * From the `ec_brand` field.
   */
  brand?: string;
  /**
   * Category of the product (e.g., `["Electronics", "Electronics|Televisions", "Electronics|Televisions|4K Televisions"]`)
   *
   * From the `ec_category` field.
   */
  categories?: string[];
  /**
   * Base price of the product or variant.
   *
   * From the `ec_price` field.
   */
  price?: number;
  /**
   * Short description of the product.
   *
   * From the `ec_shortdesc` field.
   */
  shortDescription?: string;
  /**
   * Product image in URL format.
   *
   * From the `ec_image` field.
   */
  thumbnailUrl?: string;
  /**
   * Product images in URL format.
   *
   * From the `ec_images` field.
   */
  imageUrls?: string[];
  /**
   * Promotional price of product or variant.
   *
   * From the `ec_promo_price` field.
   */
  promoPrice?: number;
  /**
   * Availability of the product (i.e., whether the product is in stock).
   *
   * From the `ec_in_stock` field.
   */
  inStock?: boolean;
  /**
   * A rating based system from 0-10.
   *
   * From the `ec_rating` field.
   */
  rating?: number;
  /**
   * The tags of the product.
   */
  tags?: string[];
};

export type ProductRecommendation = Product;
