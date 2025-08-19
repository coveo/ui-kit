import type {UnknownAction} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from './controllers.js';
import type {
  EngineDefinitionControllersPropsOption,
  EngineStaticState,
} from './engine.js';
import type {OptionsTuple} from './utilities.js';

type FetchStaticStateOptions = {
  /**
   * The navigator context for this request. Used to pass required client information when making server-side requests.
   */
  navigatorContext: NavigatorContext;
};

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
    FetchStaticStateOptions &
      EngineDefinitionControllersPropsOption<TControllersProps>
  >
) => Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;
