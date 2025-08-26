import {composeFunction} from '../../common/controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {
  BuildParameters,
  BuildResult,
  CommerceControllerDefinitionsMap,
  HydrateStaticStateFromBuildResultParameters,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function hydratedRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions> {
  return composeFunction(
    async (...params: HydrateStaticStateParameters<TControllerDefinitions>) => {
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(SolutionType.recommendation);

      const buildResult = (await solutionTypeBuild(
        ...(params as BuildParameters<TControllerDefinitions>)
      )) as BuildResult<TControllerDefinitions>;

      const staticState = await hydratedRecommendationStaticStateFactory(
        controllerDefinitions,
        options
      ).fromBuildResult({
        buildResult,
        searchActions: params[0]!.searchActions,
      });
      return staticState;
    },
    {
      fromBuildResult: async (
        ...params: HydrateStaticStateFromBuildResultParameters<TControllerDefinitions>
      ) => {
        const [
          {
            buildResult: {engine, controllers},
            searchActions,
          },
        ] = params;

        searchActions.forEach((action) => {
          engine.dispatch(action);
        });
        await engine.waitForRequestCompletedAction();
        return {engine, controllers};
      },
    }
  );
}
