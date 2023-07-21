import {ProductRecommendation} from '../../product-listing.index';

export type ProductRecommendationTemplateCondition = (
  productRec: ProductRecommendation
) => boolean;

export interface ProductRecommendationTemplate<Content = unknown> {
  /**
   * The stored content of the template.
   */
  content: Content;
  /**
   * A list of conditions that must be fulfilled for this template to be selected.
   */
  conditions: ProductRecommendationTemplateCondition[];
  /**
   * A value which the manager will fallback to when multiple templates' conditions are fulfilled.
   * Templates with higher priority values will be selected over others. The minimum value is `0`.
   */
  priority?: number;
  /**
   * A list of index fields that are necessary to render the template.
   */
  fields?: string[];
}
