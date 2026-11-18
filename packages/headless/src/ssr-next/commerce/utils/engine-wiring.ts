import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger, type LoggerOptions} from '../../../app/logger.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {isTrackedRequest} from '../../common/tracked-request.js';
import type {CommonBuildConfig} from '../types/build.js';
import type {
  CommerceControllerDefinitionsMap,
  CommerceEngineDefinitionOptions,
} from '../types/engine.js';
import type {WithViewUrl} from './view-url.js';

const ensurenavigatorContext = (buildConfig: CommonBuildConfig, loggerOptions?: LoggerOptions) => {
  if (!buildConfig.navigatorContext) {
    const logger = buildLogger(loggerOptions);
    logger.error(
      'No navigatorContext was provided. This may impact analytics accuracy, personalization, and session tracking. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
    );
  }
};

export function augmentCommerceEngineOptions<
  TControllerDefinitions extends CommerceControllerDefinitionsMap,
>(
  engineOptions: CommerceEngineDefinitionOptions<TControllerDefinitions>,
  buildConfig: WithViewUrl<CommonBuildConfig>
): CommerceEngineOptions {
  const {cart, context} = buildConfig;

  ensurenavigatorContext(buildConfig, engineOptions.loggerOptions);

  return {
    ...engineOptions,
    navigatorContextProvider: () => buildConfig.navigatorContext,
    configuration: {
      ...engineOptions.configuration,
      ...(buildConfig.accessToken !== undefined && {
        accessToken: buildConfig.accessToken,
      }),
      // A visitor without a client ID is not tracked: the engine built for the request, and the one
      // hydrated from its static state in the browser, send no analytics.
      ...(!isTrackedRequest(buildConfig.navigatorContext) && {
        analytics: {...engineOptions.configuration.analytics, enabled: false},
      }),
      preprocessRequest: augmentPreprocessRequestWithForwardedFor({
        preprocessRequest: engineOptions.configuration.preprocessRequest,
        navigatorContext: buildConfig.navigatorContext,
        loggerOptions: engineOptions.loggerOptions,
      }),
      context: {
        ...context,
      },
      cart,
    },
  };
}
