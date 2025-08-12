import type {UnknownAction} from '@reduxjs/toolkit';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import type {
  ControllerStaticStateMap,
  ControllersPropsMap,
} from '../../common/types/controllers.js';
import type {SolutionType} from './controller-constants.js';
import type {
  ControllerDefinitionsMap,
  EngineDefinitionControllersPropsOption,
  OptionsTuple,
} from './controller-definitions.js';
import type {EngineStaticState} from './engine.js';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../../app/navigator-context-provider.js';

export interface FetchStaticStateOptions {
  /**
   * Navigator context for this request. Used to set headers like x-forwarded-for during SSR.
   * 
   * @example
   * ```ts
   * // In your server route handler
   * const staticState = await listingEngineDefinition.fetchStaticState({
   *   navigatorContext: {
   *     forwardedFor: req.ip,
   *     referrer: req.headers.referer || null,
   *     userAgent: req.headers['user-agent'] || null,
   *     location: req.url,
   *     clientId: req.sessionID || 'anonymous'
   *   }
   * });
   * ```
   */
  navigatorContext?: NavigatorContext | NavigatorContextProvider;
}

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
 *     referrer: request.headers.referer,
 *     userAgent: request.headers['user-agent'],
 *     location: request.url,
 *     clientId: 'session-123'
 *   }
 * });
 * ```
 */
export type FetchStaticState<
  TSearchAction extends UnknownAction,
  TControllersStaticState extends ControllerStaticStateMap,
  TControllersProps extends ControllersPropsMap,
  TControllersDefinitionsMap extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
> = (
  ...params: OptionsTuple<
    FetchStaticStateOptions &
      EngineDefinitionControllersPropsOption<
        TControllersDefinitionsMap,
        TControllersProps,
        TSolutionType
      >
  >
) => Promise<EngineStaticState<TSearchAction, TControllersStaticState>>;
