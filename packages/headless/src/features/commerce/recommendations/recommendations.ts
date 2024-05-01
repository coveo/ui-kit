import {Schema} from '@coveo/bueno';
import {RecommendationsOptions} from '../../../controllers/commerce/recommendations/headless-recommendations';
import {
  nonRequiredEmptyAllowedString,
  requiredNonEmptyString,
} from '../../../utils/validate-payload';

export const recommendationsSlotDefinition = {
  slotId: requiredNonEmptyString,
  productId: nonRequiredEmptyAllowedString,
};

export const recommendationsOptionsSchema = new Schema<RecommendationsOptions>(
  recommendationsSlotDefinition
);
