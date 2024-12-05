import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
} from '../../commerce-ssr-engine/types/common.js';
import type {
  ControllersMap,
  ControllersPropsMap,
  ControllerStaticStateMap,
  OptionsTuple,
} from '../../ssr-engine/types/common.js';
import {FromBuildResult} from './from-build-result.js';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TControllers extends ControllersMap,
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
> = {
  /**
   * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
   *
   * Useful for static generation and server-side rendering.
   */
  (
    ...params: OptionsTuple<
      FetchStaticStateOptions &
        EngineDefinitionControllersPropsOption<TControllersProps>
    >
  ): Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;

  fromBuildResult: FromBuildResult<
    TControllers,
    FetchStaticStateOptions,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
