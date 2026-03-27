import type {Relay} from '@coveo/relay';
import type {Logger} from 'pino';
import type {ConfigurationState} from '../../features/configuration/configuration-state.js';
import {
  buildCommerceEngine,
  type CommerceEngine,
} from '../commerce-engine/commerce-engine.js';
import {engineMarkerKey} from '../engine-marker.js';
import type {LoggerOptions} from '../logger.js';
import {buildLogger} from '../logger.js';
import type {NavigatorContext} from '../navigator-context-provider.js';
import {
  buildSearchEngine,
  type SearchEngine,
} from '../search-engine/search-engine.js';
import {redactEngine} from '../state-key.js';
import {
  type FrankensteinEngineConfiguration,
  frankensteinEngineConfigurationSchema,
} from './frankenstein-engine-configuration.js';
import {
  commerceEngineKey,
  searchEngineKey,
} from './frankenstein-engine-utils.js';

export type {FrankensteinEngineConfiguration};

/**
 * The engine that unifies Coveo search and commerce capabilities into a single instance.
 *
 * Each sub-engine maintains its own independent Redux store. Controllers are routed
 * to the correct sub-engine via `buildController`'s `supportedEngines` option.
 *
 * Sub-engines are siloed: `dispatch`, `subscribe`, and `addReducers` are intentionally
 * not exposed at the Frankenstein engine level to avoid unwarranted side effects.
 * Use the `supportedEngines` option in `buildController` to route controllers to the
 * appropriate sub-engine.
 *
 * @group Engine
 */
export interface FrankensteinEngine {
  readonly [engineMarkerKey]: 'frankenstein';
  /**
   * The internal search sub-engine.
   * @internal
   */
  readonly [searchEngineKey]: SearchEngine;
  /**
   * The internal commerce sub-engine.
   * @internal
   */
  readonly [commerceEngineKey]: CommerceEngine;

  /**
   * Enable analytics tracking on both sub-engines.
   */
  enableAnalytics(): void;
  /**
   * Disable analytics tracking on both sub-engines.
   */
  disableAnalytics(): void;

  /**
   * The logger instance used by the engine.
   */
  readonly logger: Logger;

  /**
   * The Relay instance used by the engine.
   */
  readonly relay: Relay;

  /**
   * The navigator context (referer, location, UserAgent).
   */
  readonly navigatorContext: NavigatorContext;

  /**
   * The readonly global headless engine configuration.
   */
  readonly configuration: ConfigurationState;
}

/**
 * The Frankenstein engine options.
 *
 * @group Engine
 */
export interface FrankensteinEngineOptions {
  /**
   * The Frankenstein engine configuration options.
   */
  configuration: FrankensteinEngineConfiguration;

  /**
   * The logger options.
   */
  loggerOptions?: LoggerOptions;
}

/**
 * Creates a Frankenstein engine instance that combines search and commerce capabilities.
 *
 * @param options - The Frankenstein engine options.
 * @returns A Frankenstein engine instance.
 *
 * @group Engine
 */
export function buildFrankensteinEngine(
  options: FrankensteinEngineOptions
): FrankensteinEngine {
  const logger = buildLogger(options.loggerOptions);
  const {configuration} = options;

  validateConfiguration(configuration, logger);

  const searchEngine = buildSearchEngine({
    configuration: {
      organizationId: configuration.organizationId,
      accessToken: configuration.accessToken,
      renewAccessToken: configuration.renewAccessToken,
      preprocessRequest: configuration.preprocessRequest,
      name: configuration.name ? `${configuration.name}:search` : undefined,
      analytics: configuration.analytics,
      environment: configuration.environment,
      search: configuration.search,
    },
    loggerOptions: options.loggerOptions,
  });

  const commerceEngine = buildCommerceEngine({
    configuration: {
      organizationId: configuration.organizationId,
      accessToken: configuration.accessToken,
      renewAccessToken: configuration.renewAccessToken,
      preprocessRequest: configuration.preprocessRequest,
      name: configuration.name ? `${configuration.name}:commerce` : undefined,
      analytics: {
        trackingId: configuration.commerce.trackingId,
        enabled: configuration.analytics?.enabled,
        proxyBaseUrl: configuration.analytics?.proxyBaseUrl,
        source: configuration.analytics?.source,
      },
      environment: configuration.environment,
      context: configuration.commerce.context,
      cart: configuration.commerce.cart,
      proxyBaseUrl: configuration.commerce.proxyBaseUrl,
    },
    loggerOptions: options.loggerOptions,
  });

  const engine: FrankensteinEngine = {
    [engineMarkerKey]: 'frankenstein' as const,
    [searchEngineKey]: searchEngine,
    [commerceEngineKey]: commerceEngine,

    enableAnalytics() {
      searchEngine.enableAnalytics();
      commerceEngine.enableAnalytics();
    },

    disableAnalytics() {
      searchEngine.disableAnalytics();
      commerceEngine.disableAnalytics();
    },

    // The search and commerce sub-engines share the same base configuration
    // (organizationId, accessToken, environment, etc.), so relay, logger, and
    // navigatorContext are equivalent across both. The search engine is used as
    // the canonical source for these shared properties.
    get relay() {
      return searchEngine.relay;
    },

    get logger() {
      return searchEngine.logger;
    },

    get navigatorContext() {
      return searchEngine.navigatorContext;
    },

    get configuration() {
      return searchEngine.state.configuration;
    },
  };

  return redactEngine(engine, [searchEngineKey, commerceEngineKey]);
}

function validateConfiguration(
  configuration: FrankensteinEngineConfiguration,
  logger: Logger
) {
  try {
    frankensteinEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Frankenstein engine configuration error');
    throw error;
  }
}
