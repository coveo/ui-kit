import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {CaseAssistAppState} from '../../state/case-assist-app-state';
import {debug, caseAssistConfiguration} from '../reducers';
import {
  CaseAssistEngineConfiguration,
  caseAssistEngineConfigurationSchema,
} from './case-assist-engine-configuration';
import {buildLogger} from '../logger';
import {Logger} from 'pino';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {isNullOrUndefined} from '@coveo/bueno';
import {CaseAssistAPIClient} from '../../api/service/case-assist/case-assist-api-client';
import {CaseAssistThunkExtraArguments} from '../case-assist-thunk-extra-arguments';
import {setCaseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-actions';

export {CaseAssistEngineConfiguration};

const caseassistEngineReducers = {
  debug,
  caseAssist: caseAssistConfiguration,
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

  const thunkArguments: CaseAssistThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: caseAssistAPIClient,
  };

  const augmentedOptions: EngineOptions<CaseAssistEngineReducers> = {
    ...options,
    reducers: caseassistEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {caseAssistId, locale} = options.configuration;

  if (!isNullOrUndefined(caseAssistId)) {
    engine.dispatch(
      setCaseAssistConfiguration({
        caseAssistId,
        locale,
      })
    );
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
    logger.error(error, 'Case Assist engine configuration error');
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
