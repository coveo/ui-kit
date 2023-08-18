import {AnyAction} from '@reduxjs/toolkit';
import {
  ControllerSSRStateMap,
  ControllersPropsMap,
  EngineSSRState,
} from './common';

export type EngineDefinitionFetchInitialStateOptions<
  TControllersSSRState extends ControllersPropsMap
> = {controllers: TControllersSSRState};

export type FetchInitialStateWithoutProps<
  TControllersSSRState extends ControllerSSRStateMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(): Promise<
    EngineSSRState<TSearchFulfilledAction, TControllersSSRState>
  >;
};

export type FetchInitialStateWithProps<
  TControllersSSRState extends ControllerSSRStateMap,
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
  ): Promise<EngineSSRState<TSearchFulfilledAction, TControllersSSRState>>;
};
