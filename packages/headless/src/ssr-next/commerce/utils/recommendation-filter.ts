import type {
  Recommendations,
  RecommendationsOptions,
} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {MultipleRecommendationError} from '../../common/errors.js';
import type {RecommendationsDefinitionMeta} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {recommendationInternalOptionKey} from '../types/controller-constants.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definitions.js';

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
 * Extracts recommendation controller definitions from a controller definitions map.
 *
 * @param controllerDefinitions - Map of controller definitions
 * @returns Object containing only the recommendation controller definitions
 */
export function getRecommendationDefinitions(
  controllerDefinitions: ControllerDefinitionsMap<Controller>
): Record<
  string,
  ControllerDefinition<Controller> & RecommendationsDefinitionMeta
> {
  const recommendationMap: Record<
    string,
    ControllerDefinition<Controller> & RecommendationsDefinitionMeta
  > = {};

  for (const [name, definition] of Object.entries(controllerDefinitions)) {
    if (isRecommendationDefinition(definition)) {
      recommendationMap[name] = definition;
    }
  }

  return recommendationMap;
}

export function filterRecommendationControllers<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  controllers: Record<string, Controller>,
  controllerDefinitions: TControllerDefinitions
) {
  const slotIdSet = new Set<string>();

  const ensureSingleRecommendationPerSlot = (slotId: string) => {
    throw new MultipleRecommendationError(slotId);
  };

  const filtered = Object.entries(controllerDefinitions).filter(
    ([_, value]) => {
      if (!isRecommendationDefinition(value)) {
        return false;
      }
      const {slotId} = value[recommendationInternalOptionKey];
      const key = slotId;
      if (slotIdSet.has(slotId)) {
        ensureSingleRecommendationPerSlot(slotId);
        return false;
      }
      slotIdSet.add(key);
      return true;
    }
  );

  const name = filtered.map(([name, _]) => name);

  return {
    /**
     * Go through all the controllers passed in argument and only refresh recommendation controllers.
     *
     * @param controllers - A record of all controllers where the key is the controller name and the value is the controller instance.
     * @param controllerNames - A list of all recommendation controllers to refresh
     */
    refresh(whitelist?: Array<keyof TControllerDefinitions>) {
      if (whitelist === undefined) {
        return;
      }
      const isRecommendationController = (key: string) =>
        name.includes(key) && whitelist.includes(key);

      for (const [key, controller] of Object.entries(controllers)) {
        if (isRecommendationController(key)) {
          (controller as Recommendations).refresh?.();
        }
      }
    },
  };
}
