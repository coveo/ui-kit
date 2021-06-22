export interface CartRecommendationsListOptions {
  /**
   * The SKUs of the products in the cart.
   */
  skus?: string[];
  /**
   * The maximum number of recommendations, from 1 to 50.
   *
   * @defaultValue `5`
   */
  maxNumberOfRecommendations?: number;
  /**
   * Additional fields to fetch in the results.
   */
  additionalFields?: string[];
}
