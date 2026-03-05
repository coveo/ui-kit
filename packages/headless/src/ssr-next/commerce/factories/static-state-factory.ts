import type {UnknownAction} from '@reduxjs/toolkit';
import {createStaticState} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {buildFactory} from './build-factory.js';

interface ProductListController {
  executeFirstRequest?: () => void;
  executeFirstSearch?: () => void;
}

function findProductListController(
  controllers: Record<string, unknown>
): ProductListController | undefined {
  for (const controller of Object.values(controllers)) {
    if (
      controller &&
      typeof controller === 'object' &&
      ('executeFirstRequest' in controller ||
        'executeFirstSearch' in controller)
    ) {
      return controller as ProductListController;
    }
  }
  return undefined;
}

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
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(params);

      const productListController = findProductListController(
        controllers as Record<string, unknown>
      );

      if (productListController) {
        if (
          solutionType === SolutionType.listing &&
          productListController.executeFirstRequest
        ) {
          productListController.executeFirstRequest();
        } else if (
          solutionType === SolutionType.search &&
          productListController.executeFirstSearch
        ) {
          productListController.executeFirstSearch();
        }
      }

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
