import {AnyAction} from '@reduxjs/toolkit';
import {
  ControllerSnapshotsMap,
  ControllersPropsMap,
  EngineSnapshot,
} from './common-ssr-types';

export type EngineDefinitionFetchInitialStateOptions<
  TControllersSnapshot extends ControllersPropsMap
> = {controllers: TControllersSnapshot};

export type FetchInitialStateWithoutProps<
  TControllersSnapshot extends ControllerSnapshotsMap,
  TSearchFulfilledAction extends AnyAction
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  fetchInitialState(): Promise<
    EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>
  >;
};

export type FetchInitialStateWithProps<
  TControllersSnapshot extends ControllerSnapshotsMap,
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
  ): Promise<EngineSnapshot<TSearchFulfilledAction, TControllersSnapshot>>;
};
