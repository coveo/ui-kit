import {Schema} from '@coveo/bueno';
import {RecommendationsOptions} from '../../../controllers/commerce/recommendations/headless-recommendations';
import {requiredNonEmptyString} from '../../../utils/validate-payload';

export const recommendationsSlotDefinition = {
  slotId: requiredNonEmptyString,
};

export const recommendationsOptionsSchema = new Schema<RecommendationsOptions>(
  recommendationsSlotDefinition
);
