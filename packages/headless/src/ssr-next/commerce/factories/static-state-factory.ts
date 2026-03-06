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

      if (solutionType === SolutionType.listing) {
        const executed = Object.values(controllers).some((c) => {
          if (
            'executeFirstRequest' in c &&
            typeof c.executeFirstRequest === 'function'
          ) {
            c.executeFirstRequest();
            return true;
          }
          return false;
        });

        if (!executed) {
          buildProductListing(engine).executeFirstRequest();
        }
      } else if (solutionType === SolutionType.search) {
        const executed = Object.values(controllers).some((c) => {
          if (
            'executeFirstSearch' in c &&
            typeof c.executeFirstSearch === 'function'
          ) {
            c.executeFirstSearch();
            return true;
          }
          return false;
        });

        if (!executed) {
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
