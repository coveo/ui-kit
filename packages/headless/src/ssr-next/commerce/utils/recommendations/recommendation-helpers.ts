import type {Controller} from '../../../../controllers/controller/headless-controller.js';
import type {RecommendationsDefinitionMeta} from '../../controllers/recommendations/headless-recommendations.ssr.js';
import type {
  ControllerDefinition,
  ControllerDefinitionsMap,
} from '../../types/controller-definitions.js';
import {
  isRecommendationController,
  isRecommendationDefinition,
} from './guards.js';

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

/**
 * Refreshes the specified recommendation controllers.
 *
 * @param controllers - Record of controller instances
 * @param controllerDefinitions - Map of controller definitions
 * @param controllerNames - Array of recommendation controller names to refresh
 */
export function refreshRecommendationControllers<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  controllers: Record<string, Controller>,
  recommendationDefinitions: TControllerDefinitions,
  controllerNames?: string[]
): void {
  if (!controllerNames?.length) {
    return;
  }

  const validRecommendationNames = Object.keys(recommendationDefinitions);

  // Filter to only valid recommendation controller names
  const controllersToRefresh = controllerNames.filter((name) =>
    validRecommendationNames.includes(name)
  );

  // Refresh each valid controller
  for (const controllerName of controllersToRefresh) {
    const controller = controllers[controllerName];
    if (controller && isRecommendationController(controller)) {
      controller.refresh();
    }
  }
}
