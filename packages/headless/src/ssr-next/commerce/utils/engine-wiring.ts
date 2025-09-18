import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger, type LoggerOptions} from '../../../app/logger.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
} from '../types/engine.js';

const ensureNavigatorContextProvider = (
  buildConfig: CommonBuildConfig,
  loggerOptions?: LoggerOptions
) => {
  if (!buildConfig.navigatorContextProvider) {
    const logger = buildLogger(loggerOptions);
    logger.error(
      'No navigatorContextProvider was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
    );
  }
};

export function augmentCommerceEngineOptions<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  engineOptions: CommerceEngineDefinitionOptions<TControllerDefinitions>,
  buildConfig: CommonBuildConfig
): CommerceEngineOptions {
  const {cart, context} = buildConfig;

  ensureNavigatorContextProvider(buildConfig, engineOptions.loggerOptions);

  return {
    ...engineOptions,
    navigatorContextProvider: buildConfig.navigatorContextProvider,
    configuration: {
      ...engineOptions.configuration,
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: engineOptions.configuration.preprocessRequest,
        navigatorContextProvider: buildConfig.navigatorContextProvider,
        loggerOptions: engineOptions.loggerOptions,
      }),
      context: {
        ...context,
      },
      cart,
    },
  };
}
