import {BooleanValue, Schema} from '@coveo/bueno';
import {requiredNonEmptyString} from '../../utils/validate-payload';

/**
 * The types of commerce user interfaces that can receive Placement product recommendations.
 *
 * **Tip:** Review the [Product recommendations strategies reference](https://docs.coveo.com/en/qbb1t217/coveo-merchandising-hub/product-recommendations-strategies-reference)
 * to validate that you're using the right Placements with the correct view types. E.g., a product recommendations
 * Placement using the _Bought next_ strategy should only be used with the 'checkout' or 'confirmation' view types.
 */
export type PlacementViewType =
  | 'basket'
  | 'category'
  | 'checkout'
  | 'confirmation'
  | 'home'
  | 'product'
  | 'search';

export interface PlacementRecommendationsOptions {
  /**
   * The unique identifier of the Placement to request product recommendations from.
   */
  placementId: string;
  /**
   * Whether to request product recommendations in sample mode from the Placement.
   *
   * Live recommendations unless this is set to `true`.
   */
  sample?: boolean;
}

export const optionsSchema = new Schema<
  Required<PlacementRecommendationsOptions>
>({
  placementId: requiredNonEmptyString,
  sample: new BooleanValue({required: false, default: false}),
});
