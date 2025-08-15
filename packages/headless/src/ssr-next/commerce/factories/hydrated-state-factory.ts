import type {SolutionType} from '../types/controller-constants.js';
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

export function hydratedStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions,
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
        // @ts-expect-error: TODO: KIT-4742: the wiring will fix also the type inconsistencies
        ...(params as BuildParameters<TControllerDefinitions>)
      );

      params[0]!.searchActions.forEach((action) => {
        engine.dispatch(action);
      });

      await engine.waitForRequestCompletedAction();

      return {engine, controllers};
    };
}
