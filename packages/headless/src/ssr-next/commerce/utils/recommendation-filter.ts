import type {Recommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {MultipleRecommendationError} from '../../common/errors.js';
import type {RecommendationsDefinitionMeta} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {recommendationInternalOptionKey} from '../types/controller-constants.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
} from '../types/controller-definitions.js';

/**
 * Type guard to check if a value is a recommendation controller definition, that is, a definition
 * created with `defineRecommendations()`, which carries the slot it targets.
 */
export function isRecommendationDefinition(
  value: unknown
): value is ControllerDefinition<Controller> & RecommendationsDefinitionMeta {
  if (typeof value !== 'object' || value === null || !(recommendationInternalOptionKey in value)) {
    return false;
  }
  const options = value[recommendationInternalOptionKey];
  return typeof options === 'object' && options !== null && 'slotId' in options;
}

/**
 * Extracts recommendation controller definitions from a controller definitions map.
 *
 * @param controllerDefinitions - Map of controller definitions
 * @returns Object containing only the recommendation controller definitions
 */
export function getRecommendationDefinitions(
  controllerDefinitions: Readonly<Record<string, unknown>>
): Record<string, ControllerDefinition<Controller> & RecommendationsDefinitionMeta> {
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
>(controllers: Record<string, Controller>, controllerDefinitions: TControllerDefinitions) {
  const slotIdSet = new Set<string>();

  const ensureSingleRecommendationPerSlot = (slotId: string) => {
    throw new MultipleRecommendationError(slotId);
  };

  const filtered = Object.entries(controllerDefinitions).filter(([_, value]) => {
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
  });

  const name = filtered.map(([name, _]) => name);

  return {
    /**
     * Refreshes the recommendation controllers whose names are listed; does nothing without a list.
     *
     * @param whitelist - The names of the recommendation controllers to refresh.
     */
    refresh(whitelist?: ReadonlyArray<PropertyKey>) {
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
