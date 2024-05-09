export type ChildProduct = Omit<Product, 'children' | 'totalNumberOfChildren'>;

// TODO: KIT-3164 update based on https://coveord.atlassian.net/browse/DOC-14667
export interface Product {
  /**
   * The SKU of the product.
   */
  permanentid: string;
  /**
   * The URL of the product.
   */
  clickUri: string;
  /**
   * The name of the product.
   *
   * From the `ec_name` field.
   */
  ec_name?: string;
  /**
   * The description of the product.
   *
   * From the `ec_description` field.
   */
  ec_description?: string;
  /**
   * The brand of the product.
   *
   * From the `ec_brand` field.
   */
  ec_brand?: string;
  /**
   * The category of the product (e.g., `"Electronics;Electronics|Televisions;Electronics|Televisions|4K Televisions"`).
   *
   * From the `ec_category` field.
   */
  ec_category?: string;
  /**
   * The ID used for the purpose of [product grouping](https://docs.coveo.com/en/l78i2152).
   *
   * From the `ec_item_group_id` field.
   */
  ec_item_group_id?: string;
  /**
   * The base price of the product.
   *
   * From the `ec_price` field.
   */
  ec_price?: number;
  /**
   * The promotional price of the product.
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
   * The URLs of the product image thumbnails.
   *
   * From the `ec_thumbnails` field.
   */
  ec_thumbnails?: string[];
  /**
   * The URLs of additional product images.
   *
   * From the `ec_images` field.
   */
  ec_images?: string[];

  /**
   * Whether the product is currently in stock.
   *
   * From the `ec_in_stock` field.
   */
  ec_in_stock?: boolean;
  /**
   * The product rating, from 0 to 10.
   *
   * From the `ec_rating` field.
   */
  ec_rating?: number;

  /**
   * The requested additional fields for the product.
   */
  additionalFields: Record<string, unknown>;

  /**
   * The child products of the product, fetched through [product grouping](https://docs.coveo.com/en/l78i2152).
   */
  children: ChildProduct[];

  /**
   * The total number of child products fetched through [product grouping](https://docs.coveo.com/en/l78i2152).
   */
  totalNumberOfChildren: number;
}
