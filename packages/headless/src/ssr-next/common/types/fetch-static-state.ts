import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from './controllers.js';
import type {
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
} from './engine.js';
import type {OptionsTuple} from './utilities.js';

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
> = (
  ...params: OptionsTuple<
    EngineDefinitionControllersPropsOption<TControllersProps>
  >
) => Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;
