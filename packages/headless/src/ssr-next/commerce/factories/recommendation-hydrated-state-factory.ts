import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import type {BuildParameters} from '../types/build.js';
import {buildFactory} from './build-factory.js';

export function hydratedRecommendationStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<TControllerDefinitions, SolutionType.recommendation> {
  return async (
    params: HydrateStaticStateParameters<TControllerDefinitions, SolutionType.recommendation>
  ) => {
    const {controllerProps, ...restParams} = params;

    const buildParameters: BuildParameters<TControllerDefinitions> = {
      ...restParams,
      ...(controllerProps && {controllers: controllerProps}),
    };

    const solutionTypeBuild = await buildFactory(
      controllerDefinitions,
      options
    )(SolutionType.recommendation);

    const {engine, controllers} = await solutionTypeBuild(buildParameters);

    if (params.searchActions.length > 0) {
      await Promise.all(engine.waitForRequestCompletedAction());
    }

    return {engine, controllers};
  };
}
