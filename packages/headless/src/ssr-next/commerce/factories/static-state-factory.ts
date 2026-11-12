import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {toSerializableNavigatorContext} from '../../common/serializable-navigator-context.js';
import {createStaticState} from '../controller-utils.js';
import {resolveEnableResults} from '../utils/enable-results.js';
import {filterRecommendationControllers} from '../utils/recommendation-filter.js';
import {withDefaultViewUrl} from '../utils/view-url.js';
import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {buildFactory, type SSRCommerceEngine} from './build-factory.js';

function findAndExecuteMethod(controllers: Record<string, unknown>, methodName: string): boolean {
  for (const controller of Object.values(controllers)) {
    if (typeof Object.getOwnPropertyDescriptor(controller, methodName)?.value === 'function') {
      (controller as Record<string, () => void>)[methodName]();
      return true;
    }
  }
  return false;
}

function executeFirstRequestForListing(
  controllers: Record<string, unknown>,
  engine: SSRCommerceEngine,
  enableResults: boolean
) {
  const controllerExecuted = findAndExecuteMethod(controllers, 'executeFirstRequest');
  if (!controllerExecuted) {
    buildProductListing(engine, {enableResults}).executeFirstRequest();
  }
}

function executeFirstRequestForSearch(
  controllers: Record<string, unknown>,
  engine: SSRCommerceEngine,
  enableResults: boolean
) {
  const controllerExecuted = findAndExecuteMethod(controllers, 'executeFirstSearch');
  if (!controllerExecuted) {
    buildSearch(engine, {enableResults}).executeFirstSearch();
  }
}

export function fetchStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  const enableResults = resolveEnableResults(options.enableResults);

  return <TSolutionType extends SolutionType>(solutionType: TSolutionType) =>
    async (rawParams: FetchStaticStateParameters<TControllerDefinitions, TSolutionType>) => {
      const params = withDefaultViewUrl(rawParams);
      const solutionTypeBuild = buildFactory(controllerDefinitions, options)(solutionType);
      const {engine, controllers} = await solutionTypeBuild(params);

      switch (solutionType) {
        case SolutionType.listing:
          executeFirstRequestForListing(controllers, engine, enableResults.listing);
          break;
        case SolutionType.search:
          executeFirstRequestForSearch(controllers, engine, enableResults.search);
          break;
      }

      filterRecommendationControllers(controllers, controllerDefinitions).refresh(
        params.recommendations
      );

      const searchActions = await Promise.all(engine.waitForRequestCompletedAction());

      const staticState = createStaticState<UnknownAction, TControllerDefinitions, TSolutionType>({
        searchActions,
        controllers,
      });

      return {
        ...params,
        ...staticState,
        navigatorContext: toSerializableNavigatorContext(params.navigatorContext),
        solutionType,
      };
    };
}
