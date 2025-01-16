/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {
  buildFactory,
  CommerceEngineDefinitionOptions,
} from '../commerce-ssr-engine/factories/build-factory.js';
import {hydratedStaticStateFactory} from '../commerce-ssr-engine/factories/hydrated-state-factory.js';
import {hydratedRecommendationStaticStateFactory} from '../commerce-ssr-engine/factories/recommendation-hydrated-state-factory.js';
import {fetchRecommendationStaticStateFactory} from '../commerce-ssr-engine/factories/recommendation-static-state-factory.js';
import {fetchStaticStateFactory} from '../commerce-ssr-engine/factories/static-state-factory.js';
import {
  ControllerDefinitionsMap,
  SolutionType,
} from '../commerce-ssr-engine/types/common.js';
import {EngineDefinition} from '../commerce-ssr-engine/types/core-engine.js';
import {NavigatorContextProvider} from '../navigatorContextProvider.js';
import {CommerceEngineOptions} from './commerce-engine.js';

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> extends EngineDefinition<
    TControllers,
    CommerceEngineOptions,
    TSolutionType
  > {}

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 *
 * @group Engine
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<Controller>,
>(
  options: CommerceEngineDefinitionOptions<TControllerDefinitions>
): {
  listingEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.listing
  >;
  searchEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.search
  >;
  standaloneEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.standalone
  >;
  recommendationEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.recommendation
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const getOptions = () => engineOptions;

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const build = buildFactory<TControllerDefinitions>(
    controllerDefinitions,
    getOptions()
  );
  const fetchStaticState = fetchStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    getOptions()
  );
  const hydrateStaticState = hydratedStaticStateFactory<TControllerDefinitions>(
    controllerDefinitions,
    getOptions()
  );
  const fetchRecommendationStaticState =
    fetchRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      getOptions()
    );
  const hydrateRecommendationStaticState =
    hydratedRecommendationStaticStateFactory<TControllerDefinitions>(
      controllerDefinitions,
      getOptions()
    );

  return {
    listingEngineDefinition: {
      build: build(SolutionType.listing),
      fetchStaticState: fetchStaticState(SolutionType.listing),
      hydrateStaticState: hydrateStaticState(SolutionType.listing),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      build: build(SolutionType.search),
      fetchStaticState: fetchStaticState(SolutionType.search),
      hydrateStaticState: hydrateStaticState(SolutionType.search),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    recommendationEngineDefinition: {
      build: build(SolutionType.recommendation),
      fetchStaticState: fetchRecommendationStaticState,
      hydrateStaticState: hydrateRecommendationStaticState,
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.recommendation
    >,
    // TODO KIT-3738 :  The standaloneEngineDefinition should not be async since no request is sent to the API
    standaloneEngineDefinition: {
      build: build(SolutionType.standalone),
      fetchStaticState: fetchStaticState(SolutionType.standalone),
      hydrateStaticState: hydrateStaticState(SolutionType.standalone),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
  };
}
