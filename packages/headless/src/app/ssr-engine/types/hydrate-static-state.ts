import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../engine';
import {ControllersMap, ControllersPropsMap, HydratedState} from './common';

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchFulfilledAction extends AnyAction
> {
  searchFulfilledAction: TSearchFulfilledAction;
}

export type HydrateStaticStateWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine in CSR.
   */
  hydrateStaticState(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction>
  ): Promise<HydratedState<TEngine, TControllers>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchFulfilledAction> {
  controllers: TControllersProps;
}

export type HydrateStaticStateWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateStaticState(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchFulfilledAction,
      TControllersProps
    >
  ): Promise<HydratedState<TEngine, TControllers>>;
};
