import {buildLogger, type LoggerOptions} from '../../../app/logger.js';
import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {getEngineNavigatorContext, isTrackedRequest} from '../../common/tracked-request.js';
import type {BuildConfig} from '../types/build.js';
import type {
  SearchControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';

const ensureNavigatorContext = (buildConfig: BuildConfig, loggerOptions?: LoggerOptions) => {
  if (!buildConfig.navigatorContext) {
    const logger = buildLogger(loggerOptions);
    logger.error(
      'No navigatorContext was provided, so this request sends no analytics, on the server or in the browser after hydration. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
    );
  }
};

export function augmentSearchEngineOptions<
  TControllerDefinitions extends SearchControllerDefinitionsMap,
>(
  engineOptions: SearchEngineDefinitionOptions<TControllerDefinitions>,
  buildConfig: BuildConfig
): SearchEngineOptions {
  ensureNavigatorContext(buildConfig, engineOptions.loggerOptions);
  const navigatorContext = getEngineNavigatorContext(buildConfig.navigatorContext);

  return {
    ...engineOptions,
    navigatorContextProvider: () => navigatorContext,
    configuration: {
      ...engineOptions.configuration,
      ...(buildConfig.accessToken !== undefined && {
        accessToken: buildConfig.accessToken,
      }),
      // A visitor without a client ID is not tracked: the engine built for the request, and the one
      // hydrated from its static state in the browser, send no analytics and capture nothing.
      ...(!isTrackedRequest(buildConfig.navigatorContext) && {
        analytics: {...engineOptions.configuration.analytics, enabled: false},
      }),
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: engineOptions.configuration.preprocessRequest,
        navigatorContext: buildConfig.navigatorContext,
        loggerOptions: engineOptions.loggerOptions,
      }),
    },
  };
}
