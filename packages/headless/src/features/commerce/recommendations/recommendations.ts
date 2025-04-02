import {Schema} from '@coveo/bueno';
import {StringValue} from '@coveo/bueno';
import {RecommendationsOptions} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
import {requiredNonEmptyString} from '../../../utils/validate-payload.js';

export const recommendationsSlotDefinition = {
  slotId: requiredNonEmptyString,
  productId: new StringValue({required: false, emptyAllowed: false}),
};

export const recommendationsOptionsSchema = new Schema<RecommendationsOptions>(
  recommendationsSlotDefinition
);
