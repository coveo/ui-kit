import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * Whether the request behind this navigator context may send analytics: it has a client ID, and
 * capture is not turned off.
 */
export function isTrackedRequest(navigatorContext: NavigatorContext | undefined): boolean {
  return !!navigatorContext?.clientId && navigatorContext.capture !== false;
}
