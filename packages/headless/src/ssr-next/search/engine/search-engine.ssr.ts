/**
 * Utility functions to be used for Server Side Rendering.
 */
import type {UnknownAction} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineOptions,
} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {LegacySearchAction} from '../../../features/analytics/analytics-utils.js';
import {createWaitForActionMiddleware} from '../../../utils/utils.js';
import {
  buildControllerDefinitions,
  createStaticState,
} from '../../common/controller-utils.js';
import {processNavigatorContext} from '../../common/navigator-context-utils.js';
import type {ControllerDefinitionsMap} from '../../common/types/controllers.js';
import type {
  EngineDefinition,
  EngineDefinitionOptions,
  EngineStaticState,
} from '../../common/types/engine.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
} from '../../common/types/inference.js';

/**
 * The SSR search engine.
 */
export interface SSRSearchEngine extends SearchEngine {
  waitForSearchCompletedAction(): Promise<SearchCompletedAction>;
}

export type SearchEngineDefinitionOptions<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinitionOptions<SearchEngineOptions, TControllers>;

export type SearchCompletedAction = ReturnType<
  LegacySearchAction['fulfilled' | 'rejected']
>;

function isSearchCompletedAction(
  action: unknown
): action is SearchCompletedAction {
  return /^search\/executeSearch\/(fulfilled|rejected)$/.test(
    (action as UnknownAction).type
  );
}

function buildSSRSearchEngine(options: SearchEngineOptions): SSRSearchEngine {
  const {middleware, promise} = createWaitForActionMiddleware(
    isSearchCompletedAction
  );
  const searchEngine = buildSearchEngine({
    ...options,
    middlewares: [...(options.middlewares ?? []), middleware],
  });
  return {
    ...searchEngine,
    get state() {
      return searchEngine.state;
    },
    waitForSearchCompletedAction() {
      return promise;
    },
  };
}

export type SearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SSRSearchEngine, Controller>,
> = EngineDefinition<SSRSearchEngine, TControllers>;

/**
 * Initializes a Search engine definition in SSR with per-call navigator context support.
 *
 * @param options - The search engine definition
 * @returns Engine definition with support for per-call navigator context.
 *
 * @example
 * ```ts
 * const searchEngine = defineSearchEngine(config);
 *
 * // Generate stable clientId (server-side best practice)
 * const getClientId = async (req) => {
 *   const existing = req.cookies.coveoClientId;
 *   if (existing) return existing;
 *
 *   const newId = crypto.randomUUID();
 *   res.cookie('coveoClientId', newId, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
 *   return newId;
 * };
 *
 * // Pass navigator context directly to fetchStaticState
 * const staticState = await searchEngine.fetchStaticState({
 *   navigatorContext: {
 *     clientId: await getClientId(req),
 *     forwardedFor: req.headers['x-forwarded-for'] || req.ip,
 *     referrer: req.headers.referer || null,
 *     userAgent: req.headers['user-agent'] || null,
 *     location: req.url
 *   }
 * });
 * ```
 *
 * @group Engine
 */
export function defineSearchEngine<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SearchEngine,
    Controller
  >,
>(options: SearchEngineDefinitionOptions<TControllerDefinitions>) {
  const {controllers: controllerDefinitions, ...engineOptions} = options;

  const hydrateStaticState = async (staticState: {
    searchAction: UnknownAction;
  }) => {
    const engine = buildSSRSearchEngine(engineOptions);
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap:
        {} as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });

    engine.dispatch(staticState.searchAction);
    await engine.waitForSearchCompletedAction();
    return {engine, controllers};
  };

  const fetchStaticState = async (options: {
    navigatorContext: NavigatorContext;
    controllers?: InferControllerPropsMapFromDefinitions<TControllerDefinitions>;
  }) => {
    const {engineOptions: enhancedEngineOptions, callOptions} =
      processNavigatorContext([options], engineOptions);

    const engine = buildSSRSearchEngine(enhancedEngineOptions);
    const controllers = buildControllerDefinitions({
      definitionsMap: (controllerDefinitions ?? {}) as TControllerDefinitions,
      engine,
      propsMap: (callOptions && 'controllers' in callOptions
        ? callOptions.controllers
        : {}) as InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    });

    engine.executeFirstSearch();
    const staticState = createStaticState({
      searchAction: await engine.waitForSearchCompletedAction(),
      controllers: controllers,
    }) as EngineStaticState<
      UnknownAction,
      InferControllerStaticStateMapFromDefinitions<TControllerDefinitions>
    >;

    return staticState;
  };

  return {
    fetchStaticState,
    hydrateStaticState,
  } as EngineDefinition<SSRSearchEngine, TControllerDefinitions>;
}
