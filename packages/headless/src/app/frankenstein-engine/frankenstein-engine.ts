import type {Logger} from 'pino';
import {
  buildCommerceEngine,
  type CommerceEngine,
} from '../commerce-engine/commerce-engine.js';
import type {CoreEngineNext} from '../engine.js';
import {engineMarkerKey} from '../engine-marker.js';
import type {LoggerOptions} from '../logger.js';
import {buildLogger} from '../logger.js';
import {
  buildSearchEngine,
  type SearchEngine,
} from '../search-engine/search-engine.js';
import {redactEngine, stateKey} from '../state-key.js';
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
 * Controllers declared with `supportedEngines: ['search', 'frankenstein']` or
 * `supportedEngines: ['commerce', 'frankenstein']` are automatically routed to the
 * appropriate internal sub-engine.
 *
 * @group Engine
 */
export interface FrankensteinEngine extends CoreEngineNext<{}> {
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

  // biome-ignore lint/suspicious/noExplicitAny: required for Frankenstein engine dispatch forwarding
  const dispatch = (action: any): any => {
    searchEngine.dispatch(action);
    commerceEngine.dispatch(action);
    return action;
  };

  const engine: FrankensteinEngine = {
    [engineMarkerKey]: 'frankenstein' as const,
    [searchEngineKey]: searchEngine,
    [commerceEngineKey]: commerceEngine,

    dispatch: dispatch as FrankensteinEngine['dispatch'],

    subscribe(listener: () => void) {
      const unsubscribeSearch = searchEngine.subscribe(listener);
      const unsubscribeCommerce = commerceEngine.subscribe(listener);
      return () => {
        unsubscribeSearch();
        unsubscribeCommerce();
      };
    },

    addReducers(reducers) {
      searchEngine.addReducers(reducers);
      commerceEngine.addReducers(reducers);
    },

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

    get [stateKey]() {
      const {configuration, version} = searchEngine.state;
      return {configuration, version};
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
