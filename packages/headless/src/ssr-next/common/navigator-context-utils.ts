import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../app/navigator-context-provider.js';

/**
 * Converts a navigator context object to a provider function.
 * Wraps the context object in a function that returns the object.
 */
export function convertNavigatorContextToProvider(
  navigatorContext: NavigatorContext
): NavigatorContextProvider {
  return () => navigatorContext;
}

/**
 * Extracts navigator context from fetchStaticState parameters and converts it to a provider function.
 * This handles the common pattern of extracting the first parameter and converting the navigator context.
 */
export function extractNavigatorContextProvider(
  params: unknown[]
): NavigatorContextProvider | undefined {
  const [callOptions] = params as unknown as [
    {navigatorContext?: NavigatorContext} | undefined,
  ];

  return callOptions?.navigatorContext
    ? convertNavigatorContextToProvider(callOptions.navigatorContext)
    : undefined;
}

/**
 * Extracts call options and navigator context provider from fetchStaticState parameters.
 * Returns both the original call options and the converted navigator context provider.
 */
export function extractCallOptionsAndNavigatorContextProvider(
  params: unknown[]
): {
  callOptions:
    | {navigatorContext?: NavigatorContext; controllers?: unknown}
    | undefined;
  navigatorContextProvider: NavigatorContextProvider | undefined;
} {
  const [callOptions] = params as unknown as [
    {navigatorContext?: NavigatorContext; controllers?: unknown} | undefined,
  ];

  const navigatorContextProvider = callOptions?.navigatorContext
    ? convertNavigatorContextToProvider(callOptions.navigatorContext)
    : undefined;

  return {callOptions, navigatorContextProvider};
}
