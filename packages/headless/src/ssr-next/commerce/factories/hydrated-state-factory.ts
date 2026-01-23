import type {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

export function hydratedStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
    async (
      params: HydrateStaticStateParameters<
        TControllerDefinitions,
        TSolutionType
      > & {controllerProps?: Record<string, unknown>}
    ) => {
      const {controllerProps, ...restParams} = params;

      const paramsWithControllerProps = {
        ...restParams,
        ...(controllerProps && {controllers: controllerProps}),
      } as HydrateStaticStateParameters<TControllerDefinitions, TSolutionType>;

      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(
        paramsWithControllerProps
      );

      await engine.waitForRequestCompletedAction();

      return {engine, controllers};
    };
}
