/**
 * Utility functions to be used for Commerce Server Side Rendering.
 */
import {Action, UnknownAction} from '@reduxjs/toolkit';
import {stateKey} from '../../app/state-key.js';
import {buildProductListing} from '../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../controllers/commerce/search/headless-search.js';
import type {Controller} from '../../controllers/controller/headless-controller.js';
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
} from '../commerce-ssr-engine/types/core-engine.js';
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
  waitForRequestCompletedAction(): Promise<Action>[];
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

  const middlewares: ReturnType<typeof createWaitForActionMiddleware>[] = [];
  const memo: Set<string> = new Set();

  switch (solutionType) {
    case SolutionType.listing:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isListingFetchCompletedAction
      );
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.search:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        isSearchCompletedAction
      );
      middlewares.push(actionCompletionMiddleware);
      break;
    case SolutionType.recommendation:
      middlewares.push(
        ...Array.from({length: recommendationCount}, () =>
          createWaitForActionMiddlewareForRecommendation(
            isRecommendationCompletedAction,
            memo
          )
        )
      );
      break;
    default:
      actionCompletionMiddleware = createWaitForActionMiddleware(
        noSearchActionRequired
      );
  }

  const commerceEngine = buildCommerceEngine({
    ...options,
    middlewares: [
      ...(options.middlewares ?? []),
      ...middlewares.map(({middleware}) => middleware),
    ],
  });

  return {
    ...commerceEngine,

    get [stateKey]() {
      return commerceEngine[stateKey];
    },

    waitForRequestCompletedAction() {
      return [...middlewares.map(({promise}) => promise)];
    },
  };
}

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
  recommendationEngineDefinition: CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType.recommendation
  >;
} {
  const {controllers: controllerDefinitions, ...engineOptions} = options;
  type Definition = CommerceEngineDefinition<
    TControllerDefinitions,
    SolutionType
  >;
  type BuildFunction = Definition['build'];
  type FetchStaticStateFunction = Definition['fetchStaticState']; // TODO: avoir un fetch pour les recommendations
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

  // TODO: ideally , we only want to execute that for recommendation stuff
  const recommendationFilter = () =>
    buildRecommendationFilter(controllerDefinitions ?? {});

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
      const engine = buildSSRCommerceEngine(
        solutionType,
        buildOptions?.extend
          ? await buildOptions.extend(getOptions())
          : getOptions(),
        // TODO: clean that
        solutionType === SolutionType.recommendation
          ? recommendationFilter().count
          : 0
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
        if (!getOptions().navigatorContextProvider) {
          // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
          console.warn(
            '[WARNING] Missing navigator context in server-side code. Make sure to set it with `setNavigatorContextProvider` before calling fetchStaticState()'
          );
        }
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

          switch (solutionType) {
            case SolutionType.listing:
              buildProductListing(engine).executeFirstRequest();
              break;
            case SolutionType.search:
              buildSearch(engine).executeFirstSearch();
              break;
            case SolutionType.recommendation:
              recommendationFilter().refresh(controllers);
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

  const hydrateStaticStateFactory: (
    solutionType: SolutionType
  ) => HydrateStaticStateFunction = (solutionType: SolutionType) =>
    composeFunction(
      async (...params: HydrateStaticStateParameters) => {
        if (!getOptions().navigatorContextProvider) {
          // TODO: KIT-3409 - implement a logger to log SSR warnings/errors
          console.warn(
            '[WARNING] Missing navigator context in client-side code. Make sure to set it with `setNavigatorContextProvider` before calling hydrateStaticState()'
          );
        }
        const buildResult = await buildFactory(solutionType)(
          ...(params as BuildParameters)
        );
        const staticState = await hydrateStaticStateFactory(
          solutionType
        ).fromBuildResult({
          buildResult,
          searchActions: params[0]!.searchActions,
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
              searchActions,
            },
          ] = params;

          // TODO: should be only one searchAction for search and listing
          searchActions.forEach((action) => {
            engine.dispatch(action);
          });
          await engine.waitForRequestCompletedAction();
          return {engine, controllers};
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
    recommendationEngineDefinition: {
      build: buildFactory(SolutionType.recommendation),
      fetchStaticState: fetchStaticStateFactory(SolutionType.recommendation),
      hydrateStaticState: hydrateStaticStateFactory(
        SolutionType.recommendation
      ),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.recommendation
    >,
    // TODO:  make the standaloneEngineDefinition not async since there are no search executed
    standaloneEngineDefinition: {
      build: buildFactory(SolutionType.standalone),
      fetchStaticState: fetchStaticStateFactory(SolutionType.standalone),
      hydrateStaticState: hydrateStaticStateFactory(SolutionType.standalone),
      setNavigatorContextProvider,
    } as CommerceEngineDefinition<
      TControllerDefinitions,
      SolutionType.standalone
    >,
  };
}

/// Sandbox
// const {
//   recommendationEngineDefinition,
//   searchEngineDefinition,
//   standaloneEngineDefinition,
// } = defineCommerceEngine({
//   configuration: getSampleCommerceEngineConfiguration(),
//   controllers: {
//     standaloneSearchBox: defineStandaloneSearchBox({
//       options: {redirectionUrl: 'rest'},
//     }),
//     facets: defineFacetGenerator(),
//     trending: defineRecommendations({
//       options: {slotId: 'ttt'},
//     }),
//     popular: defineRecommendations({
//       options: {slotId: 'ppp'},
//     }),
//   },
// });

// // TODO: should have a way to select which recommendation to fetch
// const r = await standaloneEngineDefinition.fetchStaticState();
// r.controllers.standaloneSearchBox;

// const b = await recommendationEngineDefinition.fetchStaticState(['trending']);
// b.controllers.trending;

// const a = await searchEngineDefinition.fetchStaticState();
// a.controllers; // TODO: should throw an error since it's not defined in search
