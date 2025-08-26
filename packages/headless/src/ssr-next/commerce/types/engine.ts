import type {UnknownAction} from '@reduxjs/toolkit';
import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import type {EngineConfiguration} from '../../../app/engine-configuration.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {ControllerStaticStateMap} from '../../common/types/controllers.js';
import type {SSRCommerceEngine} from '../factories/build-factory.js';
import type {Build} from './build.js';
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
import type {
  HydrateStaticState,
  HydrateStaticStateOptions,
} from './hydrate-static-state.js';

export type {
  HydrateStaticState,
  HydrateStaticStateOptions,
  FetchStaticState,
  FetchStaticStateOptions,
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

export type FetchStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['fetchStaticState'];

export type HydrateStaticStateFunction<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Definition<TControllerDefinitions>['hydrateStaticState'];

export type BuildParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<
  Build<
    CommerceEngineOptions,
    InferControllersMapFromDefinition<TControllerDefinitions, SolutionType>,
    InferControllerPropsMapFromDefinitions<TControllerDefinitions>,
    TControllerDefinitions,
    SolutionType
  >
>;

export type FetchStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<FetchStaticStateFunction<TControllerDefinitions>>;

export type HydrateStaticStateParameters<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = Parameters<HydrateStaticStateFunction<TControllerDefinitions>>;

type Controllers<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = InferControllersMapFromDefinition<TControllerDefinitions, SolutionType>;

export type BuildResult<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
> = {
  engine: SSRCommerceEngine;
  controllers: Controllers<TControllerDefinitions>;
};
