import type {BaseProduct, Product} from './product.js';

export enum ResultType {
  CHILD_PRODUCT = 'childProduct',
  PRODUCT = 'product',
  SPOTLIGHT = 'spotlight',
}

export interface SpotlightContent {
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
   * The result type identifier, always SPOTLIGHT for spotlight content.
   */
  resultType: ResultType.SPOTLIGHT;
}

export type BaseResult = BaseProduct | SpotlightContent;
export type Result = Product | SpotlightContent;
