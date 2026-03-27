import type {StateFromReducersMapObject} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {GeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client.js';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {InsightAPIClient} from '../../api/service/insight/insight-api-client.js';
import {interfaceLoad} from '../../features/analytics/analytics-actions.js';
import type {LegacySearchAction} from '../../features/analytics/analytics-utils.js';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions.js';
import {setInsightConfiguration} from '../../features/insight-configuration/insight-configuration-actions.js';
import {insightConfigurationReducer as insightConfiguration} from '../../features/insight-configuration/insight-configuration-slice.js';
import {fetchInterface} from '../../features/insight-interface/insight-interface-actions.js';
import {insightInterfaceReducer as insightInterface} from '../../features/insight-interface/insight-interface-slice.js';
import {executeSearch} from '../../features/insight-search/insight-search-actions.js';
import {logInsightInterfaceLoad} from '../../features/insight-search/insight-search-analytics-actions.js';
import {resultPreviewReducer as resultPreview} from '../../features/result-preview/result-preview-slice.js';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import type {InsightAppState} from '../../state/insight-app-state.js';
import {
  buildEngine,
  type CoreEngine,
  type EngineOptions,
  type ExternalEngineOptions,
  warnIfUsingNextAnalyticsModeForServiceFeature,
} from '../engine.js';
import type {InsightThunkExtraArguments} from '../insight-thunk-extra-arguments.js';
import {buildLogger} from '../logger.js';
import type {AdditionalCoreExtraArguments} from '../store.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {
  getSampleInsightEngineConfiguration,
  type InsightEngineConfiguration,
  type InsightEngineSearchConfigurationOptions,
  insightEngineConfigurationSchema,
} from './insight-engine-configuration.js';

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

/**
 * The engine for powering insight experiences.
 *
 * @group Engine
 */
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
 *
 * @group Engine
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
 *
 * @group Engine
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
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );

  const {insightId, search} = options.configuration;

  engine.dispatch(
    setInsightConfiguration({
      insightId,
    })
  );
  engine.dispatch(fetchInterface());

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
