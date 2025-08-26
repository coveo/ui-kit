import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
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
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): HydrateStaticStateFunction<
  TControllerDefinitions,
  SolutionType.recommendation
> {
  return async (
    ...params: HydrateStaticStateParameters<
      TControllerDefinitions,
      SolutionType.recommendation
    >
  ) => {
    const solutionTypeBuild = await buildFactory(
      controllerDefinitions,
      options
    )(SolutionType.recommendation);

    const {engine, controllers} = await solutionTypeBuild(
      ...(params as BuildParameters<
        TControllerDefinitions,
        SolutionType.recommendation
      >)
    );

    params[0]!.searchActions.forEach((action) => {
      engine.dispatch(action);
    });

    await engine.waitForRequestCompletedAction();

    return {engine, controllers};
  };
}
