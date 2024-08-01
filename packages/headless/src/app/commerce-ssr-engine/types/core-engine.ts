import {AnyAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller';
import {CoreEngine, CoreEngineNext} from '../../engine';
import {EngineConfiguration} from '../../engine-configuration';
import {Build} from '../../ssr-engine/types/build';
import {
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
} from '../../ssr-engine/types/common';
import {FetchStaticState} from '../../ssr-engine/types/fetch-static-state';
import {HydrateStaticState} from '../../ssr-engine/types/hydrate-static-state';
import {
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  SolutionType,
} from './common';

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<
    CoreEngine | CoreEngineNext,
    Controller
  >,
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
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
    AnyAction,
    InferControllerStaticStateMapFromDefinitions<TControllers>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Fetches the hydrated state on the client side using your engine definition and the static state.
   */
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    AnyAction,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  /**
   * Builds an engine and its controllers from an engine definition.
   */
  build: Build<
    TEngine,
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers, TSolutionType>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
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
