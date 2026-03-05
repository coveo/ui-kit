import type {UnknownAction} from '@reduxjs/toolkit';
import {createStaticState} from '../controller-utils.js';
import type {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

export function fetchStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
    async (
      params: FetchStaticStateParameters<TControllerDefinitions, TSolutionType>
    ) => {
      const solutionTypeBuild = buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers, executeFirstRequest} =
        await solutionTypeBuild(params);

      executeFirstRequest();

      const searchActions = await Promise.all(
        engine.waitForRequestCompletedAction()
      );

      const staticState = createStaticState<
        UnknownAction,
        TControllerDefinitions,
        TSolutionType
      >({
        searchActions,
        controllers,
      });

      const {controllers: controllerProps, ...restParams} = params as {
        controllers?: Record<string, unknown>;
      } & typeof params;

      return {
        ...restParams,
        ...staticState,
        ...(controllerProps && {controllerProps}),
      };
    };
}
