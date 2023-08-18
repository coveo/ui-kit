import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../engine';
import {
  ControllersMap,
  ControllersPropsMap,
  EngineAndControllers,
} from './common';

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchFulfilledAction extends AnyAction
> {
  searchFulfilledAction: TSearchFulfilledAction;
}

export type HydrateInitialStateWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchInitialState.
   *
   * Useful when hydrating a server-side-rendered engine in CSR.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction>
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

export type HydrateInitialStateWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchInitialState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateInitialState(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchFulfilledAction,
      TControllersProps
    >
  ): Promise<EngineAndControllers<TEngine, TControllers>>;
};
