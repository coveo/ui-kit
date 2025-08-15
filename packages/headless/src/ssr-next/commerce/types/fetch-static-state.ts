import type {UnknownAction} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
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

export interface FetchStaticStateOptions {
  /**
   * The navigator context for this request.
   *
   * Used to pass required client information when making server-side requests.
   *
   * @example
   * ```ts
   * // In your server route handler
   * const staticState = await listingEngineDefinition.fetchStaticState({
   *   navigatorContext: {
   *     forwardedFor: req.ip,
   *     referrer: req.headers.referer || null,
   *     userAgent: req.headers['user-agent'] || null,
   *     clientId: req.sessionID || 'anonymous'
   *   }
   * });
   * ```
   */
  navigatorContext?: NavigatorContext;
}

/**
 * Executes only the initial search for a given configuration, then returns a resumable snapshot of engine state along with the state of the controllers.
 *
 * Useful for static generation and server-side rendering.
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
