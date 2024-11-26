import {UnknownAction} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {Recommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.js';
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
  SolutionType,
} from '../types/common.js';
import {
  BuildResult,
  Controllers,
  FetchStaticStateFromBuildResultParameters,
  FetchStaticStateFunction,
  CommerceControllerDefinitionsMap,
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
  type ControllerDefinitionKeys = keyof Controllers<TControllerDefinitions>;

  const logger = buildLogger(options.loggerOptions);

  return composeFunction(
    async (...params: [controllerKeys: Array<ControllerDefinitionKeys>]) => {
      const [controllerKeys] = params;
      const uniqueControllerKeys = Array.from(new Set(controllerKeys));
      if (uniqueControllerKeys.length !== controllerKeys.length) {
        logger.warn(
          '[WARNING] Duplicate controller keys detected in recommendation fetchStaticState call. Make sure to provide only unique controller keys.'
        );
      }

      const validControllerNames = Object.keys(controllerDefinitions ?? {});
      const allowedRecommendationKeys = uniqueControllerKeys.filter(
        (key: string) => validControllerNames.includes(key)
      );

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
        allowedRecommendationKeys
      )) as BuildResult<TControllerDefinitions>;

      const staticState = await fetchRecommendationStaticStateFactory(
        controllerDefinitions,
        options
      ).fromBuildResult({
        buildResult,
        allowedRecommendationKeys,
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
            allowedRecommendationKeys,
          },
        ] = params;

        filterRecommendationControllers(
          controllers,
          controllerDefinitions ?? {},
          logger
        ).refresh(allowedRecommendationKeys);

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
  controllerDefinitions: TControllerDefinitions,
  logger: Logger
) {
  const slotIdSet = new Set<string>();

  const isRecommendationDefinition = <
    C extends ControllerDefinition<Controller>,
  >(
    controllerDefinition: C
  ): controllerDefinition is C & RecommendationsDefinitionMeta => {
    return (
      'recommendation' in controllerDefinition &&
      controllerDefinition.recommendation === true
    );
  };

  const warnDuplicateRecommendation = (slotId: string, productId?: string) => {
    logger.warn(
      'Multiple recommendation controllers found for the same slotId and productId',
      {slotId, productId}
    );
  };

  const filtered = Object.entries(controllerDefinitions).filter(
    ([_, value]) => {
      if (!isRecommendationDefinition(value)) {
        return false;
      }
      const {slotId, productId} = value.options;
      const key = `${slotId}${productId || ''}`;
      if (slotIdSet.has(key)) {
        warnDuplicateRecommendation(slotId, productId);
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
