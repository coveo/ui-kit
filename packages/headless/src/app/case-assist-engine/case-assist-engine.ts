import {isNullOrUndefined} from '@coveo/bueno';
import type {StateFromReducersMapObject} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {CaseAssistAPIClient} from '../../api/service/case-assist/case-assist-api-client.js';
import {setCaseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-actions.js';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import type {CaseAssistAppState} from '../../state/case-assist-app-state.js';
import type {CaseAssistThunkExtraArguments} from '../case-assist-thunk-extra-arguments.js';
import {
  buildEngine,
  type CoreEngine,
  type EngineOptions,
  type ExternalEngineOptions,
  warnIfUsingNextAnalyticsModeForServiceFeature,
} from '../engine.js';
import {buildLogger} from '../logger.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {
  type CaseAssistEngineConfiguration,
  caseAssistEngineConfigurationSchema,
} from './case-assist-engine-configuration.js';

export type {CaseAssistEngineConfiguration};

const caseassistEngineReducers = {
  debug,
  caseAssistConfiguration,
  searchHub,
};
type CaseAssistEngineReducers = typeof caseassistEngineReducers;
type CaseAssistEngineState =
  StateFromReducersMapObject<CaseAssistEngineReducers> &
    Partial<CaseAssistAppState>;

/**
 * The engine for powering case assist experiences.
 *
 * For example implementations, see the following [Coveo Quantic Case Assist components](https://docs.coveo.com/en/quantic/latest/reference/case-assist-components/):
 * * [quanticCaseClassification.js](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticCaseClassification/quanticCaseClassification.js)
 * * [quanticDocumentSuggestion](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticDocumentSuggestion/quanticDocumentSuggestion.js)
 *
 * @group Engine
 */
export interface CaseAssistEngine<State extends object = {}>
  extends CoreEngine<
    State & CaseAssistEngineState,
    CaseAssistThunkExtraArguments
  > {}

/**
 * The case assist engine options.
 *
 * @group Engine
 */
export interface CaseAssistEngineOptions
  extends ExternalEngineOptions<CaseAssistEngineState> {
  /**
   * The case assist engine configuration options.
   */
  configuration: CaseAssistEngineConfiguration;
}

/**
 * Creates a case assist engine instance.
 *
 * @param options - The case assist engine options.
 * @returns A case assist engine instance.
 *
 * @group Engine
 */
export function buildCaseAssistEngine(
  options: CaseAssistEngineOptions
): CaseAssistEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const caseAssistAPIClient = createCaseAssistAPIClient(
    options.configuration,
    logger
  );

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: caseAssistAPIClient,
  };

  const augmentedOptions: EngineOptions<CaseAssistEngineReducers> = {
    ...options,
    reducers: caseassistEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );

  const {caseAssistId, locale, searchHub, proxyBaseUrl} = options.configuration;

  engine.dispatch(
    setCaseAssistConfiguration({
      caseAssistId,
      locale,
      proxyBaseUrl,
    })
  );

  if (!isNullOrUndefined(searchHub)) {
    engine.dispatch(setSearchHub(searchHub));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },
  };
}

function validateConfiguration(
  configuration: CaseAssistEngineConfiguration,
  logger: Logger
) {
  try {
    caseAssistEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Case Assist engine configuration error');

    throw error;
  }
}

function createCaseAssistAPIClient(
  configuration: CaseAssistEngineConfiguration,
  logger: Logger
) {
  return new CaseAssistAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
  });
}
