import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {EngineStaticState} from '../../common/types/engine.js';
import type {BuildConfig} from './build.js';
import type {BakedInSearchControllers} from './controller-definition.js';
import type {SearchEngineDefinitionControllersPropsOption} from './engine.js';

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
  params: BuildConfig &
    SearchEngineDefinitionControllersPropsOption<TControllersProps>
) => Promise<
  EngineStaticState<
    TSearchAction,
    TControllersStaticState & BakedInSearchControllers
  > &
    BuildConfig
>;
