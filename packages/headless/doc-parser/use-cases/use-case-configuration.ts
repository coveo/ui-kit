import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver.js';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver.js';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver.js';

export interface UseCaseConfiguration {
  controllers: ControllerConfiguration[];
  actionLoaders: ActionLoaderConfiguration[];
  engine: EngineConfiguration;
}
