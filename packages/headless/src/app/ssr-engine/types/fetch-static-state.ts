import {AnyAction} from '@reduxjs/toolkit';
import {
  ControllerStaticStateMap,
  ControllersPropsMap,
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
  OptionsTuple,
} from './common';

export type FetchStaticStateOptions = {};

export type FetchStaticState<
  TControllersStaticState extends ControllerStaticStateMap,
  TSearchAction extends AnyAction,
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
};
