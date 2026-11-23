import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import {buildLogger, type LoggerOptions} from '../../../app/logger.js';
import {augmentPreprocessRequestWithForwardedFor} from '../../common/augment-preprocess-request.js';
import {getEngineNavigatorContext, isTrackedRequest} from '../../common/tracked-request.js';
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
      'No navigatorContext was provided, so this request sends no analytics, on the server or in the browser after hydration. Refer to the Coveo documentation on server-side navigation context for implementation guidance.'
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
  const {enableResults: _enableResults, ...options} = engineOptions;

  ensurenavigatorContext(buildConfig, engineOptions.loggerOptions);
  const navigatorContext = getEngineNavigatorContext(buildConfig.navigatorContext);

  return {
    ...options,
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
      context: {
        ...context,
      },
      cart,
    },
  };
}
