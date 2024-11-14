/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */
import {Action, UnknownAction} from '@reduxjs/toolkit';
import {stateKey} from '../../app/state-key.js';
import {buildProductListing} from '../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../controllers/commerce/search/headless-search.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
import {
  defineFacetGenerator,
  defineRecommendations,
  defineStandaloneSearchBox,
  getSampleCommerceEngineConfiguration,
} from '../../ssr-commerce.index.js';
import {
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
} from '../../utils/utils.js';
import {
  buildControllerDefinitions,
  buildRecommendationFilter,
} from '../commerce-ssr-engine/common.js';
import {
  ControllerDefinitionsMap,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  SolutionType,
} from '../commerce-ssr-engine/types/common.js';
import {
  EngineDefinition,
  EngineDefinitionOptions,
  RecommendationEngineDefinition,
} from '../commerce-ssr-engine/types/core-engine.js';
import {buildLogger} from '../logger.js';
import {NavigatorContextProvider} from '../navigatorContextProvider.js';
import {composeFunction} from '../ssr-engine/common.js';
import {createStaticState} from '../ssr-engine/common.js';
import {
  EngineStaticState,
  InferControllerPropsMapFromDefinitions,
} from '../ssr-engine/types/common.js';
import {
  CommerceEngine,
  CommerceEngineOptions,
  buildCommerceEngine,
} from './commerce-engine.js';

/**
 * The SSR commerce engine.
 */
export interface SSRCommerceEngine extends CommerceEngine {
  /**
   * Waits for the search to be completed and returns a promise that resolves to a `SearchCompletedAction`.
   */
  waitForRequestCompletedAction(): Promise<Action>;
}

export type CommerceEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> = EngineDefinitionOptions<CommerceEngineOptions, TControllers>;

function isListingFetchCompletedAction(action: unknown): action is Action {
  return /^commerce\/productListing\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function isSearchCompletedAction(action: unknown): action is Action {
  return /^commerce\/search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function isRecommendationCompletedAction(action: unknown): action is Action {
  return /^commerce\/recommendations\/fetch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function noSearchActionRequired(_action: unknown): _action is Action {
  return true;
}

function buildSSRCommerceEngine(
  solutionType: SolutionType,
  options: CommerceEngineOptions,
  recommendationCount: number
): SSRCommerceEngine {
  let actionCompletionMiddleware: ReturnType<
    typeof createWaitForActionMiddleware
  >;

  switch (solutionType) {
    case SolutionType.listing:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isListingFetchCompletedAction
      );
      break;
    case SolutionType.search:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isSearchCompletedAction
      );
      break;
    default:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        noSearchActionRequired
      );
  }

  const memo: Set<string> = new Set();
  const recommendationActionMiddlewares = Array.from(
    {length: recommendationCount},
    () =>
      createWaitForActionMiddlewareForRecommendation(
        isRecommendationCompletedAction,
        memo
      )
  );

  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [
      ...(options.middlewares ?? []),
      actionCompletionMiddleware.middleware,
      ...recommendationActionMiddlewares.map(({middleware}) => middleware),
    ],
  });

  return {
    ...commerceEngine,

    get [stateKey]() {
      return commerceEngine[stateKey];
    },

    waitForRequestCompletedAction() {
      return actionCompletionMiddleware.promise;
    },
  };
}

interface RecommendationCommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
> extends RecommendationEngineDefinition<
    SSRCommerceEngine,
    TControllers,
    CommerceEngineOptions
  > {}

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRCommerceEngine, Controller>,
  TSolutionType extends SolutionType,
> extends EngineDefinition<
    SSRCommerceEngine,
    TControllers,
    CommerceEngineOptions,
    TSolutionType
  > {}

/**
 * Initializes a Commerce engine definition in SSR with given controllers definitions and commerce engine config.
 * @param options - The commerce engine definition
 * @returns Three utility functions to fetch the initial state of the engine in SSR, hydrate the state in CSR,
 *  and a build function that can be used for edge cases requiring more control.
 */
export function defineCommerceEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRCommerceEngine,
    Controller
  >,
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
  recommendationEngineDefinition: RecommendationCommerceEngineDefinition<TControllerDefinitions>;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  type Definition = CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType
  >;
  type BuildFunction = Definition['build'];
  type FetchStaticStateFunction = Definition['fetchStaticState'];
  type HydrateStaticStateFunction = Definition['hydrateStaticState'];
  type FetchStaticStateFromBuildResultFunction =
    FetchStaticStateFunction['fromBuildResult'];
  type HydrateStaticStateFromBuildResultFunction =
    HydrateStaticStateFunction['fromBuildResult'];
  type BuildParameters = Parameters<BuildFunction>;
  type FetchStaticStateParameters = Parameters<FetchStaticStateFunction>;

  type HydrateStaticStateParameters = Parameters<HydrateStaticStateFunction>;
  type FetchStaticStateFromBuildResultParameters =
    Parameters<FetchStaticStateFromBuildResultFunction>;
  type HydrateStaticStateFromBuildResultParameters =
    Parameters<HydrateStaticStateFromBuildResultFunction>;

  type RecommendationDefinition =
    RecommendationCommerceEngineDefinition<TControllerDefinitions>;
  type RecommendationBuildFunction = RecommendationDefinition['build'];
  type RecommendationFetchStaticStateFunction =
    RecommendationDefinition['fetchStaticState'];
  type RecommendationHydrateStaticStateFunction =
    RecommendationDefinition['hydrateStaticState'];
  type RecommendationFetchStaticStateFromBuildResultFunction =
    RecommendationFetchStaticStateFunction['fromBuildResult'];
  type RecommendationHydrateStaticStateFromBuildResultFunction =
    RecommendationHydrateStaticStateFunction['fromBuildResult'];
  type RecommendationBuildParameters = Parameters<RecommendationBuildFunction>;
  type RecommendationFetchStaticStateParameters =
    Parameters<RecommendationFetchStaticStateFunction>;
  type RecommendationFetchStaticFromBuildResultsParameters =
    Parameters<RecommendationFetchStaticStateFromBuildResultFunction>;
  const recommendationFilter = buildRecommendationFilter(
    controllerDefinitions ?? {}
  );

  const getOptions = () => {
    return engineOptions;
  };

  const setNavigatorContextProvider = (
    navigatorContextProvider: NavigatorContextProvider
  ) => {
    engineOptions.navigatorContextProvider = navigatorContextProvider;
  };

  const buildFactory =
    <T extends SolutionType>(solutionType: T) =>
    async (...[buildOptions]: BuildParameters) => {
      const logger = buildLogger(options.loggerOptions);
      if (!getOptions().navigatorContextProvider) {
        logger.warn(
          '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
        );
      }

      // These are the recs..
      // But why do I even need it in the build factory ?????
      // logger.warn(buildOptions?.c);

      const engine = buildSSRCommerceEngine(
        solutionType,
        buildOptions?.extend
          ? await buildOptions.extend(getOptions())
          : getOptions(),
        recommendationFilter.count
      );
      const controllers = buildControllerDefinitions({
        definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
        engine,
        solutionType,
        propsMap: (buildOptions && 'controllers' in buildOptions
          ? buildOptions.controllers
          : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
      });

      return {
        engine,
        controllers,
      };
    };

  const fetchStaticStateFactory: (
    solutionType: SolutionType
  ) => FetchStaticStateFunction = (solutionType: SolutionType) =>
    composeFunction(
      async (...params: FetchStaticStateParameters) => {
        // I can't do it all, I need to split them all
        const buildResult = await buildFactory(solutionType)(...params);
        const staticState = await fetchStaticStateFactory(
          solutionType
        ).fromBuildResult({
          buildResult,
        });
        return staticState;
      },
      {
        fromBuildResult: async (
          ...params: FetchStaticStateFromBuildResultParameters
        ) => {
          const [
            {
              buildResult: {engine, controllers},
            },
          ] = params;

          if (solutionType === SolutionType.listing) {
            buildProductListing(engine).executeFirstRequest();
          } else if (solutionType === SolutionType.search) {
            buildSearch(engine).executeFirstSearch();
          } else if (solutionType === SolutionType.recommendation) {
            // here build the filter and refresh them  all
            // build every recommendation and refresh them all ?
            // buildRecommendations(engine).refresh();
            recommendationFilter.refresh(controllers);
          }

          const searchAction = await engine.waitForRequestCompletedAction();

          return createStaticState({
            searchAction,
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

  const hydrateStaticStateFactory: (
    solutionType: SolutionType
  ) => HydrateStaticStateFunction = (solutionType: SolutionType) =>
    composeFunction(
      async (...params: HydrateStaticStateParameters) => {
        const buildResult = await buildFactory(solutionType)(
          ...(params as BuildParameters)
        );
        const staticState = await hydrateStaticStateFactory(
          solutionType
        ).fromBuildResult({
          buildResult,
          searchAction: params[0]!.searchAction,
        });
        return staticState;
      },
      {
        fromBuildResult: async (
          ...params: HydrateStaticStateFromBuildResultParameters
        ) => {
          const [
            {
              buildResult: {engine, controllers},
              searchAction,
            },
          ] = params;

          engine.dispatch(searchAction);
          engine.waitForRequestCompletedAction();
          return {engine, controllers};
        },
      }
    );

  const recommendationBuildFactory =
    () =>
    async (...[buildOptions]: RecommendationBuildParameters) => {
      const logger = buildLogger(options.loggerOptions);
      if (!getOptions().navigatorContextProvider) {
        logger.warn(
          '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
        );
      }

      // These are the recs..
      // But why do I even need it in the build factory ?????
      // logger.warn(buildOptions?.c);

      const engine = buildSSRCommerceEngine(
        SolutionType.recommendation,
        buildOptions?.extend
          ? await buildOptions.extend(getOptions())
          : getOptions(),
        recommendationFilter.count
      );
      const controllers = buildControllerDefinitions({
        definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
        engine,
        solutionType: SolutionType.recommendation,
        propsMap: (buildOptions && 'controllers' in buildOptions
          ? buildOptions.controllers
          : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
      });

      return {
        engine,
        controllers,
      };
    };

  const recommendationFetchStaticStateFactory: () => RecommendationFetchStaticStateFunction =
    (solutionType: SolutionType) =>
      composeFunction(
        async (...params: RecommendationFetchStaticStateParameters) => {
          const buildResult = await recommendationBuildFactory()(...params);
          // I can't do it all, I need to split them all
          //What the hell, this function calls itself ?
          const staticState =
            await recommendationFetchStaticStateFactory().fromBuildResult({
              buildResult,
            });
          return staticState;
        },
        {
          fromBuildResult: async (
            ...params: RecommendationFetchStaticFromBuildResultsParameters
          ) => {
            const [
              {
                buildResult: {engine, controllers},
              },
            ] = params;

            if (solutionType === SolutionType.listing) {
              buildProductListing(engine).executeFirstRequest();
            } else if (solutionType === SolutionType.search) {
              buildSearch(engine).executeFirstSearch();
            } else if (solutionType === SolutionType.recommendation) {
              // here build the filter and refresh them  all
              // build every recommendation and refresh them all ?
              // buildRecommendations(engine).refresh();
              recommendationFilter.refresh(controllers);
            }

            const searchAction = await engine.waitForRequestCompletedAction();

            return createStaticState({
              searchAction,
              controllers,
            }) as EngineStaticState<
              UnknownAction,
              InferControllerStaticStateMapFromDefinitionsWithSolutionType<
                TControllerDefinitions,
                SolutionType.recommendation
              >
            >;
          },
        }
      );

  return {
    listingEngineDefinition: {
      build: buildFactory(SolutionType.listing),
      fetchStaticState: fetchStaticStateFactory(SolutionType.listing),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.listing),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.listing>,
    searchEngineDefinition: {
      build: buildFactory(SolutionType.search),
      fetchStaticState: fetchStaticStateFactory(SolutionType.search),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.search),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<TControllerDefinitions, SolutionType.search>,
    standaloneEngineDefinition: {
      build: buildFactory(SolutionType.standalone),
      fetchStaticState: fetchStaticStateFactory(SolutionType.standalone),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.standalone),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
    recommendationEngineDefinition: {
      build: recommendationBuildFactory(),
      fetchStaticState: recommendationFetchStaticStateFactory(),
      hydrateStaticState: hydrateStaticStateFactory(
        SolutionType.recommendation
      ),
      setNavigatorContextProvider,
    } as RecommendationCommerceEngineDefinition<TControllerDefinitions>,
  };
}
/// Sandbox
const {
  recommendationEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
} = defineCommerceEngine({
  configuration: getSampleCommerceEngineConfiguration(),
  controllers: {
    standaloneSearchBox: defineStandaloneSearchBox({
      options: {redirectionUrl: 'rest'},
    }),
    facets: defineFacetGenerator(),
    trending: defineRecommendations({
      options: {slotId: 'ttt'},
    }),
    popular: defineRecommendations({
      options: {slotId: 'ppp'},
    }),
  },
});

// TODO: should have a way to select which recommendation to fetch
const r = await standaloneEngineDefinition.fetchStaticState();
r.controllers.standaloneSearchBox;

const b = await recommendationEngineDefinition.fetchStaticState(['popular']);
b.controllers.trending;

const a = await searchEngineDefinition.fetchStaticState();
a.controllers; // TODO: should throw an error since it's not defined in search
