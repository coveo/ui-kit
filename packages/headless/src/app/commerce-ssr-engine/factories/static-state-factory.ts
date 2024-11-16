import {UnknownAction} from '@reduxjs/toolkit';
import {buildProductListing} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../controllers/commerce/search/headless-search.js';
import {composeFunction} from '../../ssr-engine/common.js';
import {createStaticState} from '../common.js';
import {
  EngineStaticState,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  SolutionType,
} from '../types/common.js';
import {
  FetchStaticStateFromBuildResultParameters,
  FetchStaticStateFunction,
  FetchStaticStateParameters,
  CommerceControllerDefinitionsMap,
} from '../types/core-engine.js';
import {
  buildFactory,
  CommerceEngineDefinitionOptions,
} from './build-factory.js';

// TODO: this is not a factory. either make it a factory or rename it
export const fetchStaticStateFactory: <
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  controllerDefinitions: TControllerDefinitions,
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
) => (
  solutionType: SolutionType
) => FetchStaticStateFunction<TControllerDefinitions> =
  <TControllerDefinitions extends CommerceControllerDefinitionsMap>(
    controllerDefinitions: TControllerDefinitions,
    options: CommerceEngineDefinitionOptions<TControllerDefinitions>
  ) =>
  (solutionType: SolutionType) =>
    composeFunction(
      async (...params: FetchStaticStateParameters<TControllerDefinitions>) => {
        const solutionTypeBuild = await buildFactory(controllerDefinitions, {
          ...options,
        })(solutionType);
        const buildResult = await solutionTypeBuild(...params);
        const staticStateBuild = await fetchStaticStateFactory(
          controllerDefinitions,
          options
        )(solutionType);
        const staticState = await staticStateBuild.fromBuildResult({
          buildResult,
          // recommendationControllerKeys // TODO: is missing
        });
        return staticState;
      },
      {
        fromBuildResult: async (
          ...params: FetchStaticStateFromBuildResultParameters<TControllerDefinitions>
        ) => {
          const [
            {
              buildResult: {engine, controllers},
            },
          ] = params;

          switch (solutionType) {
            case SolutionType.listing:
              buildProductListing(engine).executeFirstRequest();
              break;
            case SolutionType.search:
              buildSearch(engine).executeFirstSearch();
              break;
          }

          // TODO: should be only one searchAction for search and listing
          const searchActions = await Promise.all(
            engine.waitForRequestCompletedAction()
          );

          return createStaticState({
            searchActions,
            controllers,
          }) as EngineStaticState<
            UnknownAction,
            InferControllerStaticStateMapFromDefinitionsWithSolutionType<
              TControllerDefinitions,
              SolutionType
            >
          >;
        },
      }
    );
