import {
  Controller,
  CoreEngine,
  SearchEngine,
  SearchEngineOptions,
} from '@coveo/headless';
import {InferControllerFromDefinition} from '@coveo/headless/dist/definitions/app/ssr-engine/types/common';
import {
  ControllerDefinitionsMap,
  InferControllersMapFromDefinition,
  InferControllerInitialStateMapFromDefinitions,
  EngineDefinition,
} from '@coveo/headless/ssr';
import {FunctionComponent, PropsWithChildren} from 'react';

export type ContextInitialState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> = {controllers: InferControllerInitialStateMapFromDefinitions<TControllers>};

export type ContextLiveState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> = {
  engine: TEngine;
  controllers: InferControllersMapFromDefinition<TControllers>;
};

export type ContextState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
> =
  | ContextInitialState<TEngine, TControllers>
  | ContextLiveState<TEngine, TControllers>
  | null;

export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

export type InferControllerHooksMapFromDefinition<
  TControllers extends ControllerDefinitionsMap<CoreEngine, Controller>,
> = {
  [K in keyof TControllers as `use${Capitalize<
    K extends string ? K : never
  >}`]: ControllerHook<InferControllerFromDefinition<TControllers[K]>>;
};

export type ReactEngineDefinition<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TEngineOptions,
> = EngineDefinition<TEngine, TControllers, TEngineOptions> & {
  SnapshotProvider: FunctionComponent<
    PropsWithChildren<{
      controllers: InferControllerInitialStateMapFromDefinitions<TControllers>;
    }>
  >;
  LiveProvider: FunctionComponent<
    PropsWithChildren<{
      engine: TEngine;
      controllers: InferControllersMapFromDefinition<TControllers>;
    }>
  >;
  controllers: InferControllerHooksMapFromDefinition<TControllers>;
  useEngine(): TEngine | undefined;
};

export type ReactSearchEngineDefinition<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
> = ReactEngineDefinition<SearchEngine, TControllers, SearchEngineOptions>;
