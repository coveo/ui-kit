import {Logger} from 'pino';
import {StateFromReducersMapObject} from 'redux';
import {CommerceUnifiedAPIClient} from '../../api/commerce/unified-api/unified-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {configurationReducer as configuration} from '../../features/configuration/configuration-slice';
import {versionReducer as version} from '../../features/debug/version-slice';
import {placementSetReducer as placement} from '../../features/placement-set/placement-set-slice';
import {CommercePlacementsAppState} from '../../state/commerce-placements-state';
import {CommercePlacementsThunkExtraArguments} from '../commerce-placement-thunk-extra-arguments';
import {
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
  buildEngine,
} from '../engine';
import {EngineConfiguration} from '../engine-configuration';
import {buildLogger} from '../logger';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';

const commercePlacementReducer = {placement, configuration, version};
type CommercePlacementEngineReducers = typeof commercePlacementReducer;

type CommercePlacementEngineState =
  StateFromReducersMapObject<CommercePlacementEngineReducers> &
    CommercePlacementsAppState;

export interface CommercePlacementsEngine<State extends object = {}>
  extends CoreEngine<
    State & CommercePlacementEngineState,
    CommercePlacementsThunkExtraArguments
  > {}

export interface CommercePlacementEngineOptions
  extends ExternalEngineOptions<CommercePlacementEngineState> {}

export function buildCommercePlacementEngine(
  options: CommercePlacementEngineOptions
): CommercePlacementsEngine {
  const logger = buildLogger(options.loggerOptions);
  const commerceUnifiedAPIClient = createCommerceUnifiedAPIClient(
    options.configuration,
    logger
  );

  const thunkArguments: CommercePlacementsThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: commerceUnifiedAPIClient,
  };

  const augmentedOptions: EngineOptions<CommercePlacementEngineReducers> = {
    ...options,
    reducers: commercePlacementReducer,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  return {
    ...engine,

    get state() {
      return engine.state;
    },
  };
}

function createCommerceUnifiedAPIClient(
  configuration: EngineConfiguration,
  logger: Logger
) {
  return new CommerceUnifiedAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
  });
}
