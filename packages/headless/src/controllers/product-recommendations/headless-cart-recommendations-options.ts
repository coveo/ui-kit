export interface CartRecommendationsListOptions {
  /**
   * The SKUs of products in the cart.
   */
  skus?: string[];
  /**
   * The maximum number of recommendations, from 1 to 50.
   *
   * @default 5
   */
  maxNumberOfRecommendations?: number;
}
