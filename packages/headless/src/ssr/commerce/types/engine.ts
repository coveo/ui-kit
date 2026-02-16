import type {UnknownAction} from '@reduxjs/toolkit';
import type {EngineConfiguration} from '../../../app/engine-configuration.js';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticStateMap} from '../../common/types/controllers.js';
import type {FromBuildResultOptions} from '../../common/types/from-build-result.js';
import type {CommerceEngineDefinition} from '../engine/commerce-engine.ssr.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {Build, BuildOptions} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {ControllerDefinitionsMap} from './controller-definitions.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
} from './controller-inference.js';
import type {
  FetchStaticState,
  FetchStaticStateOptions,
} from './fetch-static-state.js';
import type {FromBuildResult} from './from-build-result.js';
import type {
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

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  searchActions: TSearchAction[];
  controllers: TControllers;
}

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<Controller>,
> = TOptions & {
  /**
   * The controllers to initialize with the commerce engine.
   */
  controllers?: TControllers;
};

/**
 * @deprecated This type will be removed in the future. Use {@link CommerceEngineDefinition} instead.
 */
export interface EngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TEngineOptions,
  TSolutionType extends SolutionType,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
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
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    UnknownAction,
    InferControllerPropsMapFromDefinitions<TControllers>,
    TControllers,
    TSolutionType
  >;
  /**
   * @deprecated This method is deprecated and will be removed in a future major version. Use the `fetchStaticState` method instead.
   *
   * Builds an engine and its controllers from an engine definition.
   */
  build: Build<
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    InferControllerPropsMapFromDefinitions<TControllers>,
    TControllers,
    TSolutionType
  >;

  /**
   * @deprecated This method will be removed in a future major version. Navigator context should be provided directly when fetching the static state.
   *
   * Sets the navigator context provider.
   * This provider is essential for retrieving navigation-related data such as referrer, userAgent, location, and clientId, which are crucial for handling both server-side and client-side API requests effectively.
   *
   * Note: The implementation specifics of the navigator context provider depend on the Node.js framework being utilized. It is the developer's responsibility to appropriately define and implement the navigator context provider to ensure accurate navigation context is available throughout the application. If the user fails to provide a navigator context provider, a warning will be logged either on the server or the browser console.
   */
  setNavigatorContextProvider: (
    navigatorContextProvider: NavigatorContextProvider
  ) => void;

  /**
   * Returns the access token.
   */
  getAccessToken: () => string;

  /**
   * Updates the access token.
   * @param accessToken - The access token to update.
   */
  setAccessToken: (accessToken: string) => void;
}

export type CommerceControllerDefinitionsMap =
  ControllerDefinitionsMap<Controller>;

type Definition<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = CommerceEngineDefinition<TControllerDefinitions, SolutionType>;

type BuildFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['build'];

export type FetchStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['hydrateStaticState'];

type FetchStaticStateFromBuildResultFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = FetchStaticStateFunction<TControllerDefinitions>['fromBuildResult'];

type HydrateStaticStateFromBuildResultFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = HydrateStaticStateFunction<TControllerDefinitions>['fromBuildResult'];

export type BuildParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<BuildFunction<TControllerDefinitions>>;

export type FetchStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<FetchStaticStateFunction<TControllerDefinitions>>;

export type HydrateStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<HydrateStaticStateFunction<TControllerDefinitions>>;

export type FetchStaticStateFromBuildResultParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<FetchStaticStateFromBuildResultFunction<TControllerDefinitions>>;

export type HydrateStaticStateFromBuildResultParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<
  HydrateStaticStateFromBuildResultFunction<TControllerDefinitions>
>;

type Controllers<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = InferControllersMapFromDefinition<TControllerDefinitions, SolutionType>;

export type BuildResult<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = {
  engine: SSRCommerceEngine;
  controllers: Controllers<TControllerDefinitions>;
};
