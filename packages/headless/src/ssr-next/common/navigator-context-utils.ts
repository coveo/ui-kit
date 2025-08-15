import type {PreprocessRequest} from '../../api/preprocess-request.js';
import type {LoggerOptions} from '../../app/logger.js';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../app/navigator-context-provider.js';
import {augmentPreprocessRequestWithForwardedFor} from './augment-preprocess-request.js';

/**
 * Processes fetchStaticState parameters and returns enhanced engine options with navigator context.
 * This is the single function that handles all navigator context logic for both commerce and search engines.
 */
export function processNavigatorContext<
  TOptions extends {
    configuration: object;
    loggerOptions?: LoggerOptions;
  },
>(
  params: unknown[],
  baseOptions: TOptions
): {
  engineOptions: TOptions;
  callOptions?: {navigatorContext?: NavigatorContext; controllers?: unknown};
} {
  const [callOptions] = params as unknown as [
    {navigatorContext?: NavigatorContext; controllers?: unknown} | undefined,
  ];

  // If no navigator context, return original options
  if (!callOptions?.navigatorContext) {
    return {engineOptions: baseOptions, callOptions};
  }

  // Create provider function and enhance options
  const navigatorContextProvider: NavigatorContextProvider = () =>
    callOptions.navigatorContext!;

  const engineOptions = {
    ...baseOptions,
    navigatorContextProvider,
    configuration: {
      ...baseOptions.configuration,
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: (
          baseOptions.configuration as {preprocessRequest?: PreprocessRequest}
        )?.preprocessRequest,
        navigatorContextProvider,
        loggerOptions: baseOptions.loggerOptions,
      }),
    },
  };

  return {engineOptions, callOptions};
}
