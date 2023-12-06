import {AnyAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../engine';
import {
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
  OptionsTuple,
} from './common';
import {FromBuildResult} from './from-build-result';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TEngine extends CoreEngine,
  TControllers extends ControllersMap,
  TSearchAction extends AnyAction,
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
