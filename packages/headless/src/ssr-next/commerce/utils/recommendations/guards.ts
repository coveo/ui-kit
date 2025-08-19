import type {
  Recommendations,
  RecommendationsOptions,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.js';
import type {Controller} from '../../../../controllers/controller/headless-controller.js';
import type {RecommendationsDefinitionMeta} from '../../controllers/recommendations/headless-recommendations.ssr.js';
import {recommendationInternalOptionKey} from '../../types/controller-constants.js';
import type {ControllerDefinition} from '../../types/controller-definitions.js';

/**
 * Type guard to check if a controller definition is a recommendation controller.
 * A recommendation controller must have both the recommendation flag and a slotId.
 */
export function isRecommendationDefinition<
  C extends ControllerDefinition<Controller>,
>(
  controllerDefinition: C
): controllerDefinition is C & RecommendationsDefinitionMeta {
  const hasRecommendationFlag =
    'recommendation' in controllerDefinition &&
    controllerDefinition.recommendation === true;

  const hasValidSlotId =
    recommendationInternalOptionKey in controllerDefinition &&
    'slotId' in
      (controllerDefinition[
        recommendationInternalOptionKey
      ] as RecommendationsOptions);

  return hasRecommendationFlag && hasValidSlotId;
}

/**
 * Type guard to check if a controller instance is a recommendation controller.
 */
export function isRecommendationController(
  controller: Controller
): controller is Recommendations {
  return 'refresh' in controller && typeof controller.refresh === 'function';
}
