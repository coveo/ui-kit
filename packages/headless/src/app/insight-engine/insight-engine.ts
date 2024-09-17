import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {GeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {InsightAPIClient} from '../../api/service/insight/insight-api-client';
import {interfaceLoad} from '../../features/analytics/analytics-actions';
import {LegacySearchAction} from '../../features/analytics/analytics-utils';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {setInsightConfiguration} from '../../features/insight-configuration/insight-configuration-actions';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice';
import {executeSearch} from '../../features/insight-search/insight-search-actions';
import {logInsightInterfaceLoad} from '../../features/insight-search/insight-search-analytics-actions';
import {resultPreviewReducer as resultPreview} from '../../features/result-preview/result-preview-slice';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {searchReducer as search} from '../../features/search/search-slice';
import {InsightAppState} from '../../state/insight-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {InsightThunkExtraArguments} from '../insight-thunk-extra-arguments';
import {buildLogger} from '../logger';
import {AdditionalCoreExtraArguments} from '../store';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  InsightEngineConfiguration,
  insightEngineConfigurationSchema,
  InsightEngineSearchConfigurationOptions,
  getSampleInsightEngineConfiguration,
} from './insight-engine-configuration';

export type {
  InsightEngineConfiguration,
  InsightEngineSearchConfigurationOptions,
};
export {getSampleInsightEngineConfiguration};

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
   * @param analyticsEvent - The analytics event to log in association with the first search. If unspecified, `logInsightInterfaceLoad` will be used.
   */
  executeFirstSearch(analyticsEvent?: LegacySearchAction): void;
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
  const generatedAnswerClient = createGeneratedAnswerAPIClient(logger);

  const thunkArguments: Omit<
    InsightThunkExtraArguments,
    keyof AdditionalCoreExtraArguments
  > = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: insightAPIClient,
    streamingClient: generatedAnswerClient,
  };

  const augmentedOptions: EngineOptions<InsightEngineReducers> = {
    ...options,
    reducers: insightEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {insightId, search} = options.configuration;

  engine.dispatch(
    setInsightConfiguration({
      insightId,
    })
  );

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch(analyticsEvent = logInsightInterfaceLoad()) {
      const firstSearchExecuted = firstSearchExecutedSelector(engine.state);

      if (firstSearchExecuted) {
        return;
      }

      engine.dispatch(
        executeSearch({legacy: analyticsEvent, next: interfaceLoad()})
      );
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

function createGeneratedAnswerAPIClient(logger: Logger) {
  return new GeneratedAnswerAPIClient({
    logger,
  });
}
