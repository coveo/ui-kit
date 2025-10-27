import {buildLogger, type LoggerOptions} from '../../../app/logger.js';
import type {SearchEngineOptions} from '../../../app/search-engine/search-engine.js';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {BuildConfig, SSRSearchEngine} from '../types/build.js';
import type {ControllerDefinitionsMap} from '../types/controller-definition.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';

const ensureNavigatorContext = (
  buildConfig: BuildConfig,
  loggerOptions?: LoggerOptions
) => {
  if (!buildConfig.navigatorContext) {
    const logger = buildLogger(loggerOptions);
    logger.error(
      'No navigatorContext was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
    );
  }
};

export function augmentSearchEngineOptions<
  TControllerDefinitions extends ControllerDefinitionsMap<
    SSRSearchEngine,
    Controller
  >,
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
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: engineOptions.configuration.preprocessRequest,
        navigatorContext: buildConfig.navigatorContext,
        loggerOptions: engineOptions.loggerOptions,
      }),
    },
  };
}
