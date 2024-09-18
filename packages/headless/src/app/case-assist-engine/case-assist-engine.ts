import {isNullOrUndefined} from '@coveo/bueno';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {CaseAssistAPIClient} from '../../api/service/case-assist/case-assist-api-client';
import {setCaseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-actions';
import {caseAssistConfigurationReducer as caseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-slice';
import {debugReducer as debug} from '../../features/debug/debug-slice';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {CaseAssistThunkExtraArguments} from '../case-assist-thunk-extra-arguments';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  CaseAssistEngineConfiguration,
  caseAssistEngineConfigurationSchema,
} from './case-assist-engine-configuration';

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
 */
export interface CaseAssistEngine<State extends object = {}>
  extends CoreEngine<
    State & CaseAssistEngineState,
    CaseAssistThunkExtraArguments
  > {}

/**
 * The case assist engine options.
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
