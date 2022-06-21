import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {InsightAPIClient} from '../../api/service/insight/insight-api-client';
import {InsightAppState} from '../../state/insight-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {InsightThunkExtraArguments} from '../insight-thunk-extra-arguments';
import {buildLogger} from '../logger';
import {
  insightConfiguration,
  insightInterface,
  resultPreview,
  search,
  searchHub,
} from '../reducers';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  InsightEngineConfiguration,
  insightEngineConfigurationSchema,
} from './insight-engine-configuration';
import {Logger} from 'pino';
import {setInsightConfiguration} from '../../features/insight-configuration/insight-configuration-actions';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {logInterfaceLoad} from '../../features/analytics/analytics-actions';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {executeSearch} from '../../features/insight-search/insight-search-actions';

export type {InsightEngineConfiguration};

const insightEngineReducers = {
  insightConfiguration,
  search,
  insightInterface,
  searchHub,
  resultPreview,
};
type InsightEngineReducers = typeof insightEngineReducers;

type InsightEngineState = StateFromReducersMapObject<InsightEngineReducers> &
  Partial<InsightAppState>;

export interface InsightEngine<State extends object = {}>
  extends CoreEngine<State & InsightEngineState, InsightThunkExtraArguments> {
  /**
   * Executes the first search.
   *
   * @param analyticsEvent - The analytics event to log in association with the first search. If unspecified, `logInterfaceLoad` will be used.
   */
  executeFirstSearch(analyticsEvent?: SearchAction): void;
}

/**
 * The insight engine options.
 */
export interface InsightEngineOptions
  extends ExternalEngineOptions<InsightEngineState> {
  /**
   * The insight engine configuration options.
   */
  configuration: InsightEngineConfiguration;
}

/**
 * Creates an insight engine instance.
 *
 * @param options - The insight engine options.
 * @returns An insight engine instance.
 */
export function buildInsightEngine(
  options: InsightEngineOptions
): InsightEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const insightAPIClient = createInsightAPIClient(
    options.configuration,
    logger
  );

  const thunkArguments: InsightThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: insightAPIClient,
  };

  const augmentedOptions: EngineOptions<InsightEngineReducers> = {
    ...options,
    reducers: insightEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {insightId} = options.configuration;

  engine.dispatch(
    setInsightConfiguration({
      insightId,
    })
  );

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch(analyticsEvent = logInterfaceLoad()) {
      const firstSearchExecuted = firstSearchExecutedSelector(engine.state);

      if (firstSearchExecuted) {
        return;
      }

      engine.dispatch(executeSearch(analyticsEvent));
    },
  };
}

function validateConfiguration(
  configuration: InsightEngineConfiguration,
  logger: Logger
) {
  try {
    insightEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Insight engine configuration error');
    throw error;
  }
}
function createInsightAPIClient(
  configuration: InsightEngineConfiguration,
  logger: Logger
) {
  return new InsightAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
  });
}
