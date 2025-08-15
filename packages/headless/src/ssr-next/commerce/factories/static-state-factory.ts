import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {processNavigatorContext} from '../../common/navigator-context-utils.js';
import {createStaticState} from '../controller-utils.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from '../types/controller-inference.js';
import type {
  CommerceControllerDefinitionsMap,
  EngineStaticState,
  FetchStaticStateFunction,
  FetchStaticStateParameters,
} from '../types/engine.js';
import {
  buildFactory,
  type CommerceEngineDefinitionOptions,
} from './build-factory.js';

export function fetchStaticStateFactory<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions | undefined,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return (
    solutionType: SolutionType
  ): FetchStaticStateFunction<TControllerDefinitions> =>
    async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
      const {engineOptions} = processNavigatorContext(params, options);

      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        engineOptions
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(...params);

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

      const staticState = createStaticState({
        searchActions,
        controllers,
      }) as EngineStaticState<
        UnknownAction,
        InferControllerStaticStateMapFromDefinitionsWithSolutionType<
          TControllerDefinitions,
          SolutionType
        >
      >;
      return staticState;
    };
}
