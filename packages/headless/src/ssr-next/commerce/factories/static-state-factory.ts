import type {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {createStaticState} from '../controller-utils.js';
import type {BuildConfig} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import type {AugmentedControllerDefinition} from '../types/controller-definitions.js';
import type {InferControllerStaticStateMapFromDefinitionsWithSolutionType} from '../types/controller-inference.js';
import type {
  BakedInControllers,
  BuildParameters,
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
  controllerDefinitions: AugmentedControllerDefinition<TControllerDefinitions>,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) {
  return (
    solutionType: SolutionType
  ): FetchStaticStateFunction<TControllerDefinitions> =>
    async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
      const solutionTypeBuild = await buildFactory(
        controllerDefinitions,
        options
      )(solutionType);
      const {engine, controllers} = await solutionTypeBuild(
        ...(params as BuildParameters<TControllerDefinitions>)
      );

      options.configuration.preprocessRequest =
        augmentPreprocessRequestWithForwardedFor({
          preprocessRequest: options.configuration.preprocessRequest,
          navigatorContextProvider: options.navigatorContextProvider,
          loggerOptions: options.loggerOptions,
        });

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
        > &
          BakedInControllers
      > &
        BuildConfig<SolutionType>;

      return {
        ...params[0], // TODO: KIT-4754: remove index access after no longer relying on OptionTuple type
        ...staticState,
      };
    };
}
