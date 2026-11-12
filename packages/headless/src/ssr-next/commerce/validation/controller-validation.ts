import {MultipleRecommendationError} from '../../common/errors.js';
import {validateReservedControllerNames} from '../../common/validation/controller-validation.js';
import {recommendationInternalOptionKey} from '../types/controller-constants.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {getRecommendationDefinitions} from '../utils/recommendation-filter.js';

export const validateControllerNames = (controllers: Record<string, unknown>) =>
  validateReservedControllerNames(controllers, ['context', 'cart', 'parameterManager']);

/**
 * Throws when two recommendation controllers of the definition target the same slot, so the
 * mistake surfaces when the engine is defined rather than on the first recommendation request.
 */
export const validateRecommendationSlots = (controllers: Record<string, unknown>) => {
  const slotIds = new Set<string>();
  const recommendationDefinitions = getRecommendationDefinitions(
    controllers as ControllerDefinitionsMap<Controller>
  );
  for (const definition of Object.values(recommendationDefinitions)) {
    const {slotId} = definition[recommendationInternalOptionKey];
    if (slotIds.has(slotId)) {
      throw new MultipleRecommendationError(slotId);
    }
    slotIds.add(slotId);
  }
};
