import {SolutionType} from '../types/controller-constants.js';
import type {
  BuildParameters,
  BuildResult,
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
      // @ts-expect-error: TODO: KIT-4742: the wiring will fix also the type inconsistencies
      ...(params as BuildParameters<TControllerDefinitions>)
    )) as BuildResult<TControllerDefinitions>;

    params[0]!.searchActions.forEach((action) => {
      engine.dispatch(action);
    });

    await engine.waitForRequestCompletedAction();

    return {engine, controllers};
  };
}
