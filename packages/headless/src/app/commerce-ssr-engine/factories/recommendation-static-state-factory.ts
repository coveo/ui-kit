import {UnknownAction} from '@reduxjs/toolkit';
import {buildLogger} from '../../logger.js';
import {composeFunction} from '../../ssr-engine/common.js';
import {createStaticState, filterRecommendationControllers} from '../common.js';
import {
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
  controllerDefinitions: TControllerDefinitions,
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
          controllerDefinitions ?? {}
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
