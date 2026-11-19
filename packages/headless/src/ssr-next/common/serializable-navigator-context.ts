import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * Returns the navigator context to echo in the static state sent to the browser.
 *
 * The `forwardedFor` property (the visitor's IP address) only serves the requests sent from the server,
 * so it is left out of the serialized payload.
 */
export function toSerializableNavigatorContext(
  navigatorContext: NavigatorContext
): NavigatorContext {
  if (!navigatorContext) {
    return navigatorContext;
  }
  const {forwardedFor: _forwardedFor, ...serializable} = navigatorContext;
  return serializable;
}
