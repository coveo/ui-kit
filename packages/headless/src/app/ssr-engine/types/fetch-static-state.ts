import {UnknownAction} from '@reduxjs/toolkit';
import {CoreEngine, CoreEngineNext} from '../../engine.js';
import {
  ControllersMap,
  ControllersPropsMap,
  ControllerStaticStateMap,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
  OptionsTuple,
} from './common.js';
import {FromBuildResult} from './from-build-result.js';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TEngine extends CoreEngine | CoreEngineNext,
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
    TEngine,
    TControllers,
    FetchStaticStateOptions,
    EngineStaticState<TSearchAction, TControllersStaticState>
  >;
};
