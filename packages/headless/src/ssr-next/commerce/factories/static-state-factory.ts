import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {createStaticState} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
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
      const {engine, controllers} = await solutionTypeBuild(params);

      let executedFirstRequest = false;
      for (const controller of Object.values(controllers)) {
        if (!controller || typeof controller !== 'object') {
          continue;
        }

        if (
          solutionType === SolutionType.listing &&
          'executeFirstRequest' in controller &&
          typeof controller.executeFirstRequest === 'function'
        ) {
          controller.executeFirstRequest();
          executedFirstRequest = true;
          break;
        } else if (
          solutionType === SolutionType.search &&
          'executeFirstSearch' in controller &&
          typeof controller.executeFirstSearch === 'function'
        ) {
          controller.executeFirstSearch();
          executedFirstRequest = true;
          break;
        }
      }

      if (!executedFirstRequest) {
        if (solutionType === SolutionType.listing) {
          buildProductListing(engine).executeFirstRequest();
        } else if (solutionType === SolutionType.search) {
          buildSearch(engine).executeFirstSearch();
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
