import type {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  BuildParameters,
  CommerceControllerDefinitionsMap,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
    async (
      ...params: HydrateStaticStateParameters<
        TControllerDefinitions,
        TSolutionType
      >
    ) => {
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(
        ...(params as BuildParameters<TControllerDefinitions, TSolutionType>)
      );

      params[0]!.searchActions.forEach((action) => {
        engine.dispatch(action);
      });

      await engine.waitForRequestCompletedAction();

      return {engine, controllers};
    };
}
