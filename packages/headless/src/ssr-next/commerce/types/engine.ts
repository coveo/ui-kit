import type {UnknownAction} from '@reduxjs/toolkit';
import type {NavigatorContextProvider} from '../../../app/navigator-context-provider.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllersMap} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {SSRCommerceEngineOptions} from './build.js';
import type {SolutionType} from './controller-constants.js';
import type {
  BakedInControllers,
  ControllerDefinitionsMap,
} from './controller-definitions.js';
import type {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
} from './controller-inference.js';
import type {FetchStaticState} from './fetch-static-state.js';
import type {
  HydrateStaticState,
  HydrateStaticStateOptions,
} from './hydrate-static-state.js';

export type {
  HydrateStaticState,
  HydrateStaticStateOptions,
  FetchStaticState,
  EngineStaticState,
};

type ReservedControllerNames = 'context' | 'parameterManager' | 'cart';

type ValidateControllerNames<T extends ControllerDefinitionsMap<Controller>> = {
  [K in keyof T]: K extends ReservedControllerNames
    ? `ERROR: Controller name "${K & string}" is reserved and cannot be used. Reserved names are: context, parameterManager, cart. Please choose a different controller name.`
    : T[K];
};

/**
 * The options to create a Commerce engine definition in SSR.
 *
 * @group Engine
 */
export type CommerceEngineDefinitionOptions<
  TControllers extends
    ControllerDefinitionsMap<Controller> = ControllerDefinitionsMap<Controller>,
> = SSRCommerceEngineOptions & {
  /**
   * The controllers to initialize with the commerce engine.
   */
  controllers?: ValidateControllerNames<TControllers>;
};

export interface CommerceEngineDefinition<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> {
  /**
   * Fetches the static state on the server side using your engine definition.
   */
  fetchStaticState: FetchStaticState<
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

export interface CommerceEngineDefinitionBuildResult<
  TControllers extends ControllersMap,
> {
  engine: SSRCommerceEngine;
  controllers: TControllers & BakedInControllers;
}

export type CommerceControllerDefinitionsMap =
  ControllerDefinitionsMap<Controller>;

type Definition<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> = CommerceEngineDefinition<TControllerDefinitions, TSolutionType>;

type FetchStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> = Definition<TControllerDefinitions, TSolutionType>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> = Definition<TControllerDefinitions, TSolutionType>['hydrateStaticState'];

export type FetchStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> = Parameters<
  FetchStaticStateFunction<TControllerDefinitions, TSolutionType>
>[0];

export type HydrateStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
  TSolutionType extends SolutionType,
> = Parameters<
  HydrateStaticStateFunction<TControllerDefinitions, TSolutionType>
>[0];
