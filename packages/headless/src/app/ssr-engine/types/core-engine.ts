import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../../controllers';
import {CoreEngine} from '../../engine';
import {EngineConfiguration} from '../../engine-configuration';
import {Build} from './build';
import {
  ControllerDefinitionsMap,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './common';
import {FetchStaticState} from './fetch-static-state';
import {HydrateStaticState} from './hydrate-static-state';

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>,
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export interface EngineDefinition<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
> {
  fetchStaticState: FetchStaticState<
    InferControllerStaticStateMapFromDefinitions<TControllers>,
    AnyAction,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  hydrateStaticState: HydrateStaticState<
    TEngine,
    InferControllersMapFromDefinition<TControllers>,
    AnyAction,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
  build: Build<
    TEngine,
    TEngineOptions,
    InferControllersMapFromDefinition<TControllers>,
    InferControllerPropsMapFromDefinitions<TControllers>
  >;
}

/**
 * @internal
 */
export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['fetchStaticState']>>;

/**
 * @internal
 */
export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> = Awaited<ReturnType<T['hydrateStaticState']>>;
