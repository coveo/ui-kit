import {StandardCommerceFields} from '../fields/fields-to-include';

/**
 * The product SKUs to use as seeds when requesting Placement content.
 */
export interface PlacementSetSkus {
  /**
   * The SKUs in the user's cart.
   */
  cart: string[];
  /**
   * The SKU of the current product description page (PLP).
   */
  product?: string;
  /**
   * The SKUs of the products displayed in a product listing page (PLP).
   */
  plp: string[];
  /**
   * The SKUs of the products displayed as search results.
   */
  search: string[];
  /**
   * The SKUs of the products displayed in a checkout or confirmation page.
   */
  order: string[];
  /**
   * The SKUs of the products displayed as recommendations.
   */
  recs: string[];
}

/**
 * The view context of a Placement content request.
 */
export interface PlacementSetView {
  /**
   * The view language.
   */
  locale: string;
  /**
   * The view currency.
   */
  currency: string;
  /**
   * The view type.
   */
  type: string;
  /**
   * The view subtype.
   */
  subtype: string[];
}

/**
 * Returned Placement content.
 */
export interface Placement {
  /**
   * The callback data to send when tracking impressions of clickthroughs for this Placement.
   */
  callbackData: string;
  /**
   * The unique identifier of the campaign this Placement is a part of.
   */
  campaignId: string;
  /**
   * The unique identifier of the client that requested the Placement content.
   */
  clientId: string;
}

/**
 * A set of product badges returned by a Placement.
 */
export interface Badges extends Placement {
  /**
   * The product badges to render.
   */
  badges: Badge[];
}

/**
 * A badge returned by a Placement.
 */
export interface Badge {
  /**
   * The unique identifier of the badge.
   */
  id: string;
  /**
   * The message to display.
   */
  message: string;
}

/**
 * A set of product recommendations returned by a Placement.
 */
export interface Recommendations extends Placement {
  /**
   * The recommended products.
   */
  products: Product[];
}

/**
 * A Placement recommendation product.
 */
export type Product = {
  [Field in typeof StandardCommerceFields[number]]: Field extends
    | 'ec_images'
    | 'ec_thumbnails'
    | 'foo'
    ? string[]
    : string;
} & {
  additionalFields: string;
  childResults: Product[];
  clickUri: string;
  documentUri: string;
  permanentId: string;
  totalNumberOfChildResults: number;
};
