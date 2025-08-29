import type {SolutionType} from '../types/controller-constants.js';
import type {
  AugmentedControllerDefinition,
  FilteredBakedInControllers,
  HydratedState,
} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  HydrateStaticStateFunction,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
  type SSRCommerceEngine,
} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return (
    solutionType: SolutionType
  ): HydrateStaticStateFunction<TControllerDefinitions> =>
    async (...params: HydrateStaticStateParameters<TControllerDefinitions>) => {
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(
        ...(params as BuildParameters<TControllerDefinitions>)
      );

      params[0]!.searchActions.forEach((action) => {
        engine.dispatch(action);
      });

      await engine.waitForRequestCompletedAction();

      return {engine, controllers} as HydratedState<
        SSRCommerceEngine,
        InferControllersMapFromDefinition<
          TControllerDefinitions,
          SolutionType
        > &
          FilteredBakedInControllers<SolutionType>
      >;
    };
}
