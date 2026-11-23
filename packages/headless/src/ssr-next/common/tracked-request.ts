import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * Whether the request behind this navigator context may send analytics: it has a client ID, and
 * capture is not turned off.
 */
export function isTrackedRequest(navigatorContext: NavigatorContext | undefined): boolean {
  return !!navigatorContext?.clientId && navigatorContext.capture !== false;
}

/**
 * The navigator context of the engine built for a request. An untracked request also gets `capture`
 * turned off: its engine sends no client ID, and the Commerce API rejects a request that captures
 * without one.
 */
export function getEngineNavigatorContext(navigatorContext: NavigatorContext): NavigatorContext {
  if (!navigatorContext || isTrackedRequest(navigatorContext)) {
    return navigatorContext;
  }
  return {...navigatorContext, capture: false};
}
