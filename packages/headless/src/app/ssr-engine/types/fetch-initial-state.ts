import {AnyAction} from '@reduxjs/toolkit';
import {
  ControllerInitialStateMap,
  ControllersPropsMap,
  EngineInitialState,
} from './common';

export type EngineDefinitionFetchInitialStateOptions<
  TControllersInitialState extends ControllersPropsMap
> = {controllers: TControllersInitialState};

export type FetchInitialStateWithoutProps<
  TControllersInitialState extends ControllerInitialStateMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(): Promise<
    EngineInitialState<TSearchFulfilledAction, TControllersInitialState>
  >;
};

export type FetchInitialStateWithProps<
  TControllersInitialState extends ControllerInitialStateMap,
  TSearchFulfilledAction extends AnyAction,
  TControllersProps extends ControllersPropsMap
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(
    options: EngineDefinitionFetchInitialStateOptions<TControllersProps>
  ): Promise<
    EngineInitialState<TSearchFulfilledAction, TControllersInitialState>
  >;
};
