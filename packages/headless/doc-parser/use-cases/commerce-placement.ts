import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildPlacementManager',
    samplePaths: {},
  },
  {
    initializer: 'buildPlacementRecommendations',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadPlacementSetActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildCommercePlacementEngine',
};

export const commercePlacementUseCase = {controllers, actionLoaders, engine};
