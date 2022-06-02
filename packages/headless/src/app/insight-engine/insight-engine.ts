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
import {insightConfiguration} from '../reducers';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  InsightEngineConfiguration,
  insightEngineConfigurationSchema,
} from './insight-engine-configuration';
import {Logger} from 'pino';
import {setInsightConfiguration} from '../../features/insight-configuration/insight-configuration-actions';

export type {InsightEngineConfiguration};

const insightEngineReducers = {
  insightConfiguration,
};
type InsightEngineReducers = typeof insightEngineReducers;

type InsightEngineState = StateFromReducersMapObject<InsightEngineReducers> &
  Partial<InsightAppState>;

export interface InsightEngine<State extends object = {}>
  extends CoreEngine<State & InsightEngineState, InsightThunkExtraArguments> {}

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
