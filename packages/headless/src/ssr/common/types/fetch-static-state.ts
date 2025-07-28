import type {UnknownAction} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../../app/engine.js';
import type {
  ControllerStaticStateMap,
  ControllersMap,
  ControllersPropsMap,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
  OptionsTuple,
} from './common.js';
import type {FromBuildResult} from './from-build-result.js';

type FetchStaticStateOptions = {};

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
