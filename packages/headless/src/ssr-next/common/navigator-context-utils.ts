import type {PreprocessRequest} from '../../api/preprocess-request.js';
import type {LoggerOptions} from '../../app/logger.js';
import type {
  NavigatorContext,
  NavigatorContextProvider,
} from '../../app/navigator-context-provider.js';
import {augmentPreprocessRequestWithForwardedFor} from './augment-preprocess-request.js';

type FetchStaticStateParams = [
  {navigatorContext: NavigatorContext; controllers?: unknown},
];

/**
 * Processes fetchStaticState parameters and returns enhanced engine options with navigator context.
 * This is the single function that handles all navigator context logic for both commerce and search engines.
 */
export function processNavigatorContext<
  TOptions extends {
    configuration: object & {preprocessRequest?: PreprocessRequest};
    loggerOptions?: LoggerOptions;
  },
>(
  params: FetchStaticStateParams,
  baseOptions: TOptions
): {
  engineOptions: TOptions & {navigatorContextProvider: NavigatorContextProvider};
  callOptions?: {navigatorContext: NavigatorContext; controllers?: unknown};
} {
  const [callOptions] = params;

  // Navigator context is now required
  const navigatorContextProvider: NavigatorContextProvider = () =>
    callOptions.navigatorContext;

  const engineOptions = {
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

  return {engineOptions, callOptions};
}
