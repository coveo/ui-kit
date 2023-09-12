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
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
  ControllerStaticStateMap,
  ControllersMap,
} from './common';
import {
  FetchStaticStateWithProps,
  FetchStaticStateWithoutProps,
} from './fetch-initial-state';
import {
  HydrateStaticStateWithProps,
  HydrateStaticStateWithoutProps,
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
> extends FetchStaticStateWithoutProps<
      InferControllerStaticStateMapFromDefinitions<TControllers>,
      AnyAction
    >,
    HydrateStaticStateWithoutProps<
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
> extends FetchStaticStateWithProps<
      InferControllerStaticStateMapFromDefinitions<TControllers>,
      AnyAction,
      TControllerProps
    >,
    HydrateStaticStateWithProps<
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
export type InferStaticState<
  T extends
    | FetchStaticStateWithoutProps<ControllerStaticStateMap, AnyAction>
    | FetchStaticStateWithProps<
        ControllerStaticStateMap,
        AnyAction,
        ControllersPropsMap
      >
> = Awaited<ReturnType<T['fetchStaticState']>>;
/**
 * @internal
 */
export type InferHydratedState<
  T extends
    | HydrateStaticStateWithoutProps<CoreEngine, ControllersMap, AnyAction>
    | HydrateStaticStateWithProps<
        CoreEngine,
        ControllersMap,
        AnyAction,
        ControllersPropsMap
      >
> = Awaited<ReturnType<T['hydrateStaticState']>>;
