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

export function filterRecommendationControllers<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  controllers: Record<string, Controller>,
  controllerDefinitions: TControllerDefinitions
) {
  const slotIdSet = new Set<string>();

  const isRecommendationDefinition = <
    C extends ControllerDefinition<Controller>,
  >(
    controllerDefinition: C
  ): controllerDefinition is C & RecommendationsDefinitionMeta => {
    const isControllerRecommendation =
      'recommendation' in controllerDefinition &&
      controllerDefinition.recommendation === true;

    const hasSlotId =
      recommendationInternalOptionKey in controllerDefinition &&
      'slotId' in
        (controllerDefinition[
          recommendationInternalOptionKey
        ] as RecommendationsOptions);

    return isControllerRecommendation && hasSlotId;
  };

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
    refresh(whitelist?: string[]) {
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
