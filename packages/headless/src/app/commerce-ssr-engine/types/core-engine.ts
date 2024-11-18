import {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {CommerceEngineDefinition} from '../../commerce-engine/commerce-engine.ssr.js';
import {EngineConfiguration} from '../../engine-configuration.js';
import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {NavigatorContextProvider} from '../../navigatorContextProvider.js';
import type {FromBuildResultOptions} from '../../ssr-engine/types/from-build-result.js';
import {SSRCommerceEngine} from '../factories/build-factory.js';
import {Build, BuildOptions} from './build.js';
import {
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  SolutionType,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllerPropsMapFromDefinitions,
} from './common.js';
import {
  FetchStaticState,
  FetchStaticStateOptions,
} from './fetch-static-state.js';
import {FromBuildResult} from './from-build-result.js';
import {
  HydrateStaticState,
  HydrateStaticStateOptions,
} from './hydrate-static-state.js';

export type {
  FromBuildResult,
  FromBuildResultOptions,
  HydrateStaticState,
  HydrateStaticStateOptions,
  FetchStaticState,
  FetchStaticStateOptions,
  Build,
  BuildOptions,
};
export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TOptions & {
  /**
   * The controllers to initialize with the commerce engine.
   */
  controllers?: TControllers;
};

export interface EngineDefinition<
  TEngine extends CoreEngine | CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
  TSolutionType extends SolutionType,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    UnknownAction,
    InferControllerStaticStateMapFromDefinitionsWithSolutionType<
      TControllers,
      TSolutionType
    >,
    InferControllerPropsMapFromDefinitions<TControllers>,
    TControllers,
    TSolutionType
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    UnknownAction,
    InferControllerPropsMapFromDefinitions<TControllers>,
    TControllers,
    TSolutionType
  >;
  /**
   * Builds an engine and its controllers from an engine definition.
   */
  build: Build<
    TEngine,
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    InferControllerPropsMapFromDefinitions<TControllers>,
    TControllers,
    TSolutionType
  >;

  /**
   * Sets the navigator context provider.
   * This provider is essential for retrieving navigation-related data such as referrer, userAgent, location, and clientId, which are crucial for handling both server-side and client-side API requests effectively.
   *
   * Note: The implementation specifics of the navigator context provider depend on the Node.js framework being utilized. It is the developer's responsibility to appropriately define and implement the navigator context provider to ensure accurate navigation context is available throughout the application. If the user fails to provide a navigator context provider, a warning will be logged either on the server or the browser console.
   */
  setNavigatorContextProvider: (
    navigatorContextProvider: NavigatorContextProvider
  ) => void;
}

export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['fetchStaticState']>>;

export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['hydrateStaticState']>>;

export type InferBuildResult<
  T extends {
    build(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['build']>>;

type CustomMap = ControllerDefinitionsMap<SSRCommerceEngine, Controller>;

export type CommerceControllerDefinitionsMap = ControllerDefinitionsMap<
  SSRCommerceEngine,
  Controller
>;

type Definition<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = CommerceEngineDefinition<TControllerDefinitions, SolutionType>;

export type BuildFunction<TControllerDefinitions extends CustomMap> =
  Definition<TControllerDefinitions>['build'];

export type FetchStaticStateFunction<TControllerDefinitions extends CustomMap> =
  Definition<TControllerDefinitions>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends CustomMap,
> = Definition<TControllerDefinitions>['hydrateStaticState'];

export type FetchStaticStateFromBuildResultFunction<
  TControllerDefinitions extends CustomMap,
> = FetchStaticStateFunction<TControllerDefinitions>['fromBuildResult'];

export type HydrateStaticStateFromBuildResultFunction<
  TControllerDefinitions extends CustomMap,
> = HydrateStaticStateFunction<TControllerDefinitions>['fromBuildResult'];

export type BuildParameters<TControllerDefinitions extends CustomMap> =
  Parameters<BuildFunction<TControllerDefinitions>>;

export type FetchStaticStateParameters<
  TControllerDefinitions extends CustomMap,
> = Parameters<FetchStaticStateFunction<TControllerDefinitions>>;

export type HydrateStaticStateParameters<
  TControllerDefinitions extends CustomMap,
> = Parameters<HydrateStaticStateFunction<TControllerDefinitions>>;

export type FetchStaticStateFromBuildResultParameters<
  TControllerDefinitions extends CustomMap,
> = Parameters<FetchStaticStateFromBuildResultFunction<TControllerDefinitions>>;

export type HydrateStaticStateFromBuildResultParameters<
  TControllerDefinitions extends CustomMap,
> = Parameters<
  HydrateStaticStateFromBuildResultFunction<TControllerDefinitions>
>;

export type Controllers<TControllerDefinitions extends CustomMap> =
  InferControllersMapFromDefinition<TControllerDefinitions, SolutionType>;

export type BuildResult<TControllerDefinitions extends CustomMap> = {
  engine: SSRCommerceEngine;
  controllers: Controllers<TControllerDefinitions>;
};
