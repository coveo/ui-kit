import type {RecommendationsOptions} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
import {Schema, StringValue} from '../../../utils/bueno-zod.js';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export const recommendationsSlotDefinition = {
  slotId: requiredNonEmptyString,
  productId: new StringValue({required: false, emptyAllowed: false}),
};

export const recommendationsOptionsSchema = new Schema<RecommendationsOptions>(
  recommendationsSlotDefinition
);
