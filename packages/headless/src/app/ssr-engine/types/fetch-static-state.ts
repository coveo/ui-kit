import {AnyAction} from '@reduxjs/toolkit';
import {
  ControllerStaticStateMap,
  ControllersPropsMap,
  EngineStaticState,
} from './common';

export type EngineDefinitionFetchStaticStateOptions<
  TControllersStaticState extends ControllersPropsMap,
> = {controllers: TControllersStaticState};

export type FetchStaticStateWithoutProps<
  TControllersStaticState extends ControllerStaticStateMap,
  TSearchFulfilledAction extends AnyAction,
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchStaticState(): Promise<
    EngineStaticState<TSearchFulfilledAction, TControllersStaticState>
  >;
};

export type FetchStaticStateWithProps<
  TControllersStaticState extends ControllerStaticStateMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchStaticState(
    options: EngineDefinitionFetchStaticStateOptions<TControllersProps>
  ): Promise<
    EngineStaticState<TSearchFulfilledAction, TControllersStaticState>
  >;
};
