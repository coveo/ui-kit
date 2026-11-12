import {SolutionTypeMismatchError} from '../../common/errors.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  HydrateStaticStateParameters,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

/**
 * Refuses a static state fetched by another engine definition. A static state built by hand may
 * omit the solution type.
 */
export function ensureSolutionType(expected: SolutionType, received: SolutionType | undefined) {
  if (received !== undefined && received !== expected) {
    throw new SolutionTypeMismatchError(expected, received);
  }
}

export function hydratedStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
    async (params: HydrateStaticStateParameters<TControllerDefinitions, TSolutionType>) => {
      ensureSolutionType(solutionType, params.solutionType);

      const {controllerProps, ...restParams} = params;

      const paramsWithControllerProps = {
        ...restParams,
        ...(controllerProps && {controllers: controllerProps}),
      } as unknown as HydrateStaticStateParameters<TControllerDefinitions, TSolutionType>;

      const solutionTypeBuild = await buildFactory(controllerDefinitions, options)(solutionType);
      const {engine, controllers} = await solutionTypeBuild(paramsWithControllerProps);

      await Promise.all(engine.waitForRequestCompletedAction());

      return {engine, controllers};
    };
}
