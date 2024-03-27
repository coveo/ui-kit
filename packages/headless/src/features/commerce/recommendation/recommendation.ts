import {Schema, StringValue} from '@coveo/bueno';
import {RecommendationsOptions} from '../../../controllers/commerce/recommendations/headless-recommendations';

export const recommendationSlotDefinition = new StringValue({required: true});

export const recommendationsOptionsSchema = new Schema<RecommendationsOptions>({
  slotId: recommendationSlotDefinition,
});
