import {composeFunction} from '../../ssr-engine/common.js';
import {SolutionType} from '../types/common.js';
import {
  BuildParameters,
  BuildResult,
  HydrateStaticStateFromBuildResultParameters,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
  CommerceControllerDefinitionsMap,
} from '../types/core-engine.js';
import {
  buildFactory,
  CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function hydrateRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions> {
  return composeFunction(
    async (...params: HydrateStaticStateParameters<TControllerDefinitions>) => {
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(SolutionType.recommendation, {count: 1111}); // TODO: FIXME:

      const buildResult = (await solutionTypeBuild(
        ...(params as BuildParameters<TControllerDefinitions>)
      )) as BuildResult<TControllerDefinitions>; // TODO: check if can remove the cast

      const staticState = await hydrateRecommendationStaticStateFactory(
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
