import type {UnknownAction} from '@reduxjs/toolkit';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../../app/navigator-context-provider.js';
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
  navigatorContext?: NavigatorContext | NavigatorContextProvider;
};

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
 *
 * @example
 * ```ts
 * // Pass navigator context directly in the options
 * const staticState = await engineDefinition.fetchStaticState({
 *   navigatorContext: {
 *     forwardedFor: request.ip,
 *     referrer: request.headers.referer || null,
 *     userAgent: request.headers['user-agent'] || null,
 *     clientId: 'session-123'
 *   }
 * });
 * ```
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
