export interface ProductRecommendation {
  /**
   * The SKU of the product.
   */
  permanentid: string;
  /**
   * A direct link to the product in URL format.
   */
  clickUri: string;
  /**
   * The name of the product.
   *
   * From the `ec_name` field.
   */
  ec_name?: string;
  /**
   * The brand of the product.
   *
   * From the `ec_brand` field.
   */
  ec_brand?: string;
  /**
   * The category of the product (e.g., `"Electronics"`, `"Electronics|Televisions"`, or `"Electronics|Televisions|4K Televisions"`).
   *
   * From the `ec_category` field.
   */
  ec_category?: string;
  /**
   * The base price of the product or variant.
   *
   * From the `ec_price` field.
   */
  ec_price?: number;
  /**
   * The promotional price of the product or variant.
   *
   * From the `ec_promo_price` field.
   */
  ec_promo_price?: number;
  /**
   * A short description of the product.
   *
   * From the `ec_shortdesc` field.
   */
  ec_shortdesc?: string;
  /**
   * Product images in URL format.
   *
   * From the `ec_thumbnails` field.
   */
  ec_thumbnails?: string[];
  /**
   * Additional product images in URL format.
   *
   * From the `ec_images` field.
   */
  ec_images?: string[];

  /**
   * The availability of the product (i.e., whether it's in stock).
   *
   * From the `ec_in_stock` field.
   */
  ec_in_stock?: boolean;
  /**
   * A rating system. Ratings range from 0-10.
   *
   * From the `ec_rating` field.
   */
  ec_rating?: number;

  /**
   * An object containing the requested additional fields for the product.
   */
  additionalFields: Record<string, unknown>;

  // Deprecated fields

  /**
   * @deprecated Use `permanentid` instead.
   */
  sku?: string;
  /**
   * @deprecated Use `ec_name` instead.
   */
  name?: string;
  /**
   * @deprecated Use `clickUri` instead.
   */
  link?: string;
  /**
   * @deprecated Use `ec_brand` instead.
   */
  brand?: string;
  /**
   * @deprecated Use `ec_category` instead.
   */
  category?: string;
  /**
   * @deprecated Use `ec_price` instead.
   */
  price?: number;
  /**
   * @deprecated Use `ec_shortdesc` instead.
   */
  shortDescription?: string;
  /**
   * @deprecated Use `ec_thumbnails` instead.
   */
  thumbnailUrl?: string;
  /**
   * @deprecated Use `ec_images` instead.
   */
  imageUrls?: string[];
  /**
   * @deprecated Use `ec_promo_price` instead.
   */
  promoPrice?: number;
  /**
   * @deprecated Use `ec_in_stock` instead.
   */
  inStock?: boolean;
  /**
   * @deprecated Use `ec_rating` instead.
   */
  rating?: number;
}

// Change this list when changing the fields exposed by `ProductRecommendation`
export const ProductRecommendationDefaultFields: string[] = [
  'permanentid',
  'ec_name',
  'ec_brand',
  'ec_category',
  'ec_price',
  'ec_promo_price',
  'ec_shortdesc',
  'ec_thumbnails',
  'ec_images',
  'ec_in_stock',
  'ec_rating',
];
