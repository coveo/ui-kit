import type {HighlightKeyword} from '../../../utils/highlight.js';
import type {ResultPosition, ResultType} from './result.js';

export type ChildProduct = Omit<
  BaseProduct,
  'children' | 'totalNumberOfChildren'
>;

// TODO: KIT-3164 update based on https://coveord.atlassian.net/browse/DOC-14667
export interface BaseProduct {
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
  ec_name: string | null;
  /**
   * The description of the product.
   *
   * From the `ec_description` field.
   */
  ec_description: string | null;
  /**
   * The brand of the product.
   *
   * From the `ec_brand` field.
   */
  ec_brand: string | null;
  /**
   * The category of the product (for example, `"Electronics;Electronics|Televisions;Electronics|Televisions|4K Televisions"`).
   *
   * From the `ec_category` field.
   */
  ec_category: string[];
  /**
   * The ID used for the purpose of [product grouping](https://docs.coveo.com/en/l78i2152).
   *
   * From the `ec_item_group_id` field.
   */
  ec_item_group_id: string | null;
  /**
   * The base price of the product.
   *
   * From the `ec_price` field.
   */
  ec_price: number | null;
  /**
   * The promotional price of the product.
   *
   * From the `ec_promo_price` field.
   */
  ec_promo_price: number | null;
  /**
   * A short description of the product.
   *
   * From the `ec_shortdesc` field.
   */
  ec_shortdesc: string | null;
  /**
   * The URLs of the product image thumbnails.
   *
   * From the `ec_thumbnails` field.
   */
  ec_thumbnails: string[];
  /**
   * The URLs of additional product images.
   *
   * From the `ec_images` field.
   */
  ec_images: string[];
  /**
   * Whether the product is currently in stock.
   *
   * From the `ec_in_stock` field.
   */
  ec_in_stock: boolean | null;
  /**
   * The product rating, from 0 to 10.
   *
   * From the `ec_rating` field.
   */
  ec_rating: number | null;
  /**
   * The gender the product is intended for.
   */
  ec_gender: string | null;
  /**
   * The product ID.
   */
  ec_product_id: string | null;
  /**
   * The color of the product.
   */
  ec_color: string | null;
  /**
   * The listing that the product belongs to.
   */
  ec_listing: string | null;

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
  totalNumberOfChildren: number | null;
  /**
   * The contextual excerpt generated for the product.
   *
   * @example
   * ... This orange sea kayak is perfect for beginner and experienced kayakers ... and want to enjoy the water without having to deal with the hassle of attaching a boat to their kayak.
   */
  excerpt?: string | null;
  /**
   * The length and offset of each word to highlight in the product name.
   */
  nameHighlights?: HighlightKeyword[];
  /**
   * The length and offset of each word to highlight in the product excerpt string.
   */
  excerptHighlights?: HighlightKeyword[];
  /**
   * @deprecated Use `excerptHighlights` instead.
   *
   * The length and offset of each word to highlight in the product excerpt string.
   */
  excerptsHighlights?: HighlightKeyword[];
  /**
   * The ID of the response that returned the product.
   */
  responseId?: string;
  /**
   * The result type of the product.
   */
  resultType: ResultType.PRODUCT | ResultType.CHILD_PRODUCT;
}

export interface Product extends ResultPosition, BaseProduct {}
