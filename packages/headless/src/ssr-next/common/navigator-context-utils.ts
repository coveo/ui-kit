import type {PreprocessRequest} from '../../api/preprocess-request.js';
import type {LoggerOptions} from '../../app/logger.js';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../app/navigator-context-provider.js';
import {augmentPreprocessRequestWithForwardedFor} from './augment-preprocess-request.js';

/**
 * Extracts navigator context from fetchStaticState parameters and creates the necessary configuration.
 * This is the single entry point for all navigator context processing.
 */
export function extractNavigatorContextConfig(params: unknown[]): {
  navigatorContextProvider?: NavigatorContextProvider;
  callOptions?: {navigatorContext?: NavigatorContext; controllers?: unknown};
} {
  const [callOptions] = params as unknown as [
    {navigatorContext?: NavigatorContext; controllers?: unknown} | undefined,
  ];

  if (!callOptions?.navigatorContext) {
    return {callOptions};
  }

  return {
    callOptions,
    navigatorContextProvider: () => callOptions.navigatorContext!,
  };
}

/**
 * Creates engine options with navigator context configuration applied.
 * This eliminates duplication between commerce and search engines.
 */
export function createEngineOptionsWithNavigatorContext<
  TOptions extends {
    configuration: {preprocessRequest?: PreprocessRequest};
    loggerOptions?: LoggerOptions;
  },
>(
  baseOptions: TOptions,
  navigatorContextProvider?: NavigatorContextProvider
): TOptions {
  if (!navigatorContextProvider) {
    return baseOptions;
  }

  return {
    ...baseOptions,
    navigatorContextProvider,
    configuration: {
      ...baseOptions.configuration,
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: baseOptions.configuration.preprocessRequest,
        navigatorContextProvider,
        loggerOptions: baseOptions.loggerOptions,
      }),
    },
  };
}
