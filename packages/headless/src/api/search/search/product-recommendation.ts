/**
 *
 * Deprecated. The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 */
export interface ProductRecommendation {
  /**
   * This parameter is no longer used by the Coveo Usage Analytics service.
   */
  documentUri: string;
  /**
   * Document UriHash in the index.
   *
   * **Note:** This parameter is deprecated. Use the `permanentid` to identify items in the index.
   */
  documentUriHash: string;
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
   * The id used for Product Grouping.
   *
   * From the `ec_item_group_id` field.
   */
  ec_item_group_id?: string;
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

  /**
   * A list of child product recommendations in a product grouping context.
   */
  childResults: ProductRecommendation[];

  /**
   * The total number of items in the group.
   */
  totalNumberOfChildResults: number;
}

// Change this list when changing the fields exposed by `ProductRecommendation`
export const ProductRecommendationDefaultFields: string[] = [
  'uri',
  'urihash',
  'documentUri',
  'documentUriHash',
  'permanentid',
  'ec_name',
  'ec_brand',
  'ec_category',
  'ec_item_group_id',
  'ec_price',
  'ec_promo_price',
  'ec_shortdesc',
  'ec_thumbnails',
  'ec_images',
  'ec_in_stock',
  'ec_rating',
  'childResults',
  'totalNumberOfChildResults',
];
