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
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(params);

      switch (solutionType) {
        case SolutionType.listing:
          buildProductListing(engine).executeFirstRequest();
          break;
        case SolutionType.search:
          buildSearch(engine).executeFirstSearch();
          break;
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

      return {
        ...params,
        ...staticState,
      };
    };
}
