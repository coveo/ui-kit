import type {BaseProduct, Product} from './product.js';

export enum ResultType {
  CHILD_PRODUCT = 'childProduct',
  PRODUCT = 'product',
  SPOTLIGHT = 'spotlight',
}

export interface BaseSpotlightContent {
  /**
   * The unique identifier of the spotlight content.
   */
  id: string;
  /**
   * The URI to navigate to when the spotlight content is clicked.
   */
  clickUri: string;
  /**
   * The image URL for desktop display.
   */
  desktopImage: string;
  /**
   * The image URL for mobile display.
   */
  mobileImage?: string;
  /**
   * The name of the spotlight content.
   */
  name?: string;
  /**
   * The description of the spotlight content.
   */
  description?: string;
  /**
   * The ID of the response that returned the spotlight content.
   */
  responseId?: string;
  /**
   * The result type identifier, always SPOTLIGHT for spotlight content.
   */
  resultType: ResultType.SPOTLIGHT;
}

export interface ResultPosition {
  /**
   * The 1-based result's position across the non-paginated result set.
   *
   * For example, if the result is the third one on the second page, and there are 10 results per page, its position is 13 (not 3).
   */
  position: number;
}

export interface SpotlightContent
  extends ResultPosition,
    BaseSpotlightContent {}

export type BaseResult = BaseProduct | BaseSpotlightContent;
export type Result = Product | SpotlightContent;
