import {UnknownAction} from '@reduxjs/toolkit';
import {
  Recommendations,
  RecommendationsOptions,
} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
import {RecommendationsDefinitionMeta} from '../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {Controller} from '../../../controllers/controller/headless-controller.js';
import {buildLogger} from '../../logger.js';
import {composeFunction} from '../../ssr-engine/common.js';
import {createStaticState} from '../common.js';
import {
  ControllerDefinition,
  ControllerDefinitionsMap,
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  recommendationInternalOptionKey,
  SolutionType,
} from '../types/common.js';
import {
  BuildResult,
  FetchStaticStateFromBuildResultParameters,
  FetchStaticStateFunction,
  CommerceControllerDefinitionsMap,
  FetchStaticStateParameters,
} from '../types/core-engine.js';
import {
  buildFactory,
  CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function fetchRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): FetchStaticStateFunction<TControllerDefinitions> {
  const logger = buildLogger(options.loggerOptions);

  return composeFunction(
    async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
      if (!options.navigatorContextProvider) {
        logger.warn(
          '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
        );
      }

      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(SolutionType.recommendation);

      const buildResult = (await solutionTypeBuild(
        ...params
      )) as BuildResult<TControllerDefinitions>;

      const staticState = await fetchRecommendationStaticStateFactory(
        controllerDefinitions,
        options
      ).fromBuildResult({
        buildResult,
      });
      return staticState;
    },
    {
      fromBuildResult: async (
        ...params: FetchStaticStateFromBuildResultParameters<TControllerDefinitions>
      ) => {
        const [
          {
            buildResult: {engine, controllers},
          },
        ] = params;

        filterRecommendationControllers(
          controllers,
          controllerDefinitions ?? {}
        ).refresh();

        const searchActions = await Promise.all(
          engine.waitForRequestCompletedAction()
        );

        return createStaticState({
          searchActions,
          controllers,
        }) as EngineStaticState<
          UnknownAction,
          InferControllerStaticStateMapFromDefinitionsWithSolutionType<
            TControllerDefinitions,
            SolutionType
          >
        >;
      },
    }
  );
}

function filterRecommendationControllers<
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
    const isControllerRecommendationEnabled =
      'recommendation' in controllerDefinition &&
      controllerDefinition.recommendation === true;

    const hasSlotId =
      recommendationInternalOptionKey in controllerDefinition &&
      'slotId' in
        (controllerDefinition[
          recommendationInternalOptionKey
        ] as RecommendationsOptions);

    return isControllerRecommendationEnabled && hasSlotId;
  };

  const ensureSingleRecommendationPerSlot = (slotId: string) => {
    throw new Error(
      `Multiple recommendation controllers found for the same slotId: ${slotId}. Only one recommendation controller per slotId is supported.`
    );
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
    refresh() {
      const isRecommendationController = (key: string) => name.includes(key);

      for (const [key, controller] of Object.entries(controllers)) {
        if (isRecommendationController(key)) {
          (controller as Recommendations).refresh?.();
        }
      }
    },
  };
}
