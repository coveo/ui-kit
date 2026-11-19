import {buildLogger} from '@coveo/headless/ssr-internal';
import type {LoggerOptions} from '@coveo/headless';
import type {SearchEngineOptions} from '@coveo/headless';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {BuildConfig} from '../types/build.js';
import type {
  SearchControllerDefinitionsMap,
  SearchEngineDefinitionOptions,
} from '../types/engine.js';

const ensureNavigatorContext = (buildConfig: BuildConfig, loggerOptions?: LoggerOptions) => {
  if (!buildConfig.navigatorContext) {
    const logger = buildLogger(loggerOptions);
    logger.error(
      'No navigatorContext was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
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

  return {
    ...engineOptions,
    navigatorContextProvider: () => buildConfig.navigatorContext,
    configuration: {
      ...engineOptions.configuration,
      ...(buildConfig.accessToken !== undefined && {
        accessToken: buildConfig.accessToken,
      }),
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: engineOptions.configuration.preprocessRequest,
        navigatorContext: buildConfig.navigatorContext,
        loggerOptions: engineOptions.loggerOptions,
      }),
    },
  };
}
