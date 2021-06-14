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
   * Name of the product.
   *
   * From the `ec_name` field.
   */
  ec_name?: string;
  /**
   * Product brand.
   *
   * From the `ec_brand` field.
   */
  ec_brand?: string;
  /**
   * Category of the product (e.g., `"Electronics"`, `"Electronics|Televisions"`, or `"Electronics|Televisions|4K Televisions"`)
   *
   * From the `ec_category` field.
   */
  ec_category?: string;
  /**
   * Base price of the product or variant.
   *
   * From the `ec_price` field.
   */
  ec_price?: number;
  /**
   * Promotional price of product or variant.
   *
   * From the `ec_promo_price` field.
   */
  ec_promo_price?: number;
  /**
   * Short description of the product.
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
   * Availability of the product (i.e., whether the product is in stock).
   *
   * From the `ec_in_stock` field.
   */
  ec_in_stock?: boolean;
  /**
   * A rating based system from 0-10.
   *
   * From the `ec_rating` field.
   */
  ec_rating?: number;

  /**
   * An object containing the requested additional fields for the product.
   */
  additionalFields: Record<string, unknown>;
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
