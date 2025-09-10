import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {SearchEngineDefinitionControllersPropsOption} from './engine.js';

export type FetchStaticStateParameters<
  TControllersProps extends ControllersPropsMap,
> = SearchEngineDefinitionControllersPropsOption<TControllersProps>;

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
  params: FetchStaticStateParameters<TControllersProps>
) => Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;
