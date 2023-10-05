import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../engine';
import {ControllersMap, ControllersPropsMap, HydratedState} from './common';

export interface EngineDefinitionHydrateOptionsWithoutProps<
  TSearchAction extends AnyAction,
> {
  searchAction: TSearchAction;
}

export type HydrateStaticStateWithoutProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchAction extends AnyAction,
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine in CSR.
   */
  hydrateStaticState(
    options: EngineDefinitionHydrateOptionsWithoutProps<TSearchAction>
  ): Promise<HydratedState<TEngine, TControllers>>;
};

export interface EngineDefinitionHydrateOptionsWithProps<
  TSearchAction extends AnyAction,
  TControllersProps extends ControllersPropsMap,
> extends EngineDefinitionHydrateOptionsWithoutProps<TSearchAction> {
  controllers: TControllersProps;
}

export type HydrateStaticStateWithProps<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchAction extends AnyAction,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Creates a new engine from the snapshot of the engine created in SSR with fetchStaticState.
   *
   * Useful when hydrating a server-side-rendered engine.
   */
  hydrateStaticState(
    options: EngineDefinitionHydrateOptionsWithProps<
      TSearchAction,
      TControllersProps
    >
  ): Promise<HydratedState<TEngine, TControllers>>;
};
