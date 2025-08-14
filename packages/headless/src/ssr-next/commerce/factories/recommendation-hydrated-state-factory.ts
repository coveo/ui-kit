import {SolutionType} from '../types/controller-constants.js';
import type {HydratedState} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {
  BakedInControllers,
  BuildParameters,
  BuildResult,
  CommerceControllerDefinitionsMap,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
  type SSRCommerceEngine,
} from './build-factory.js';

export function hydratedRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions> {
  return async (
    ...params: HydrateStaticStateParameters<TControllerDefinitions>
  ) => {
    const solutionTypeBuild = await buildFactory(
      controllerDefinitions,
      options
    )(SolutionType.recommendation);

    const {engine, controllers} = (await solutionTypeBuild(
      ...(params as BuildParameters<TControllerDefinitions>)
    )) as BuildResult<TControllerDefinitions>;

    params[0]!.searchActions.forEach((action) => {
      engine.dispatch(action);
    });

    await engine.waitForRequestCompletedAction();

    return {engine, controllers} as HydratedState<
      SSRCommerceEngine,
      InferControllersMapFromDefinition<TControllerDefinitions, SolutionType> &
        BakedInControllers
    >;
  };
}
