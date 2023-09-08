import {AnyAction} from '@reduxjs/toolkit';
import {Controller} from '../../../controllers';
import {CoreEngine} from '../../engine';
import {EngineConfiguration} from '../../engine-configuration';
import {BuildWithProps, BuildWithoutProps} from './build';
import {
  ControllerDefinitionsMap,
  ControllersPropsMap,
  HasKeys,
  InferControllerPropsMapFromDefinitions,
  InferControllerInitialStateMapFromDefinitions,
  InferControllersMapFromDefinition,
  ControllerInitialStateMap,
  ControllersMap,
} from './common';
import {
  FetchInitialStateWithProps,
  FetchInitialStateWithoutProps,
} from './fetch-initial-state';
import {
  HydrateInitialStateWithProps,
  HydrateInitialStateWithoutProps,
} from './hydrate-initial-state';

export type EngineDefinitionOptions<
  TOptions extends {configuration: EngineConfiguration},
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>
> = TOptions & {
  /**
   * The controllers to initialize with the search engine.
   */
  controllers?: TControllers;
};

export type EngineDefinition<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions
> = HasKeys<InferControllerPropsMapFromDefinitions<TControllers>> extends true
  ? EngineDefinitionWithProps<
      TEngine,
      TControllers,
      TEngineOptions,
      InferControllerPropsMapFromDefinitions<TControllers>
    >
  : HasKeys<InferControllerPropsMapFromDefinitions<TControllers>> extends false
  ? EngineDefinitionWithoutProps<TEngine, TControllers, TEngineOptions>
  :
      | EngineDefinitionWithProps<
          TEngine,
          TControllers,
          TEngineOptions,
          ControllersPropsMap
        >
      | EngineDefinitionWithoutProps<TEngine, TControllers, TEngineOptions>;

export interface EngineDefinitionWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions
> extends FetchInitialStateWithoutProps<
      InferControllerInitialStateMapFromDefinitions<TControllers>,
      AnyAction
    >,
    HydrateInitialStateWithoutProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction
    >,
    BuildWithoutProps<
      TEngine,
      TEngineOptions,
      InferControllersMapFromDefinition<TControllers>
    > {}

export interface EngineDefinitionWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
  TControllerProps extends ControllersPropsMap
> extends FetchInitialStateWithProps<
      InferControllerInitialStateMapFromDefinitions<TControllers>,
      AnyAction,
      TControllerProps
    >,
    HydrateInitialStateWithProps<
      TEngine,
      InferControllersMapFromDefinition<TControllers>,
      AnyAction,
      TControllerProps
    >,
    BuildWithProps<
      TEngine,
      TEngineOptions,
      InferControllersMapFromDefinition<TControllers>,
      TControllerProps
    > {}

/**
 * @internal
 */
export type InferInitialState<
  T extends
    | FetchInitialStateWithoutProps<ControllerInitialStateMap, AnyAction>
    | FetchInitialStateWithProps<
        ControllerInitialStateMap,
        AnyAction,
        ControllersPropsMap
      >
> = Awaited<ReturnType<T['fetchInitialState']>>;
/**
 * @internal
 */
export type InferHydratedState<
  T extends
    | HydrateInitialStateWithoutProps<CoreEngine, ControllersMap, AnyAction>
    | HydrateInitialStateWithProps<
        CoreEngine,
        ControllersMap,
        AnyAction,
        ControllersPropsMap
      >
> = Awaited<ReturnType<T['hydrateInitialState']>>;
