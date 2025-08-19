import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {MultipleRecommendationError} from '../../common/errors.js';
import type {RecommendationsDefinitionMeta} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {recommendationInternalOptionKey} from '../types/controller-constants.js';
import type {ControllerDefinition} from '../types/controller-definitions.js';

/**
 * Validates that each slotId is unique across recommendation controllers.
 *
 * @param controllerDefinitions - Map of controller definitions to validate
 * @throws {MultipleRecommendationError} When duplicate slotIds are found
 */
export function validateUniqueRecommendationSlotIds(
  recommendationDefinitions: Record<
    string,
    ControllerDefinition<Controller> & RecommendationsDefinitionMeta
  >
) {
  const slotIdToControllerName = new Map<string, string>();

  for (const [controllerName, definition] of Object.entries(
    recommendationDefinitions
  )) {
    const {slotId} = definition[recommendationInternalOptionKey];

    if (slotIdToControllerName.has(slotId)) {
      throw new MultipleRecommendationError(slotId);
    }

    slotIdToControllerName.set(slotId, controllerName);
  }
}

export const validateControllerNames = (
  controllers: Record<string, unknown>
) => {
  const reservedNames = ['context', 'cart', 'parameterManager'];
  const invalidNames = Object.keys(controllers).filter((name) =>
    reservedNames.includes(name)
  );
  if (invalidNames.length > 0) {
    throw new Error(
      `Reserved controller names found: ${invalidNames.join(', ')}. Please use different controller names than ${reservedNames.join(', ')}.`
    );
  }
};
