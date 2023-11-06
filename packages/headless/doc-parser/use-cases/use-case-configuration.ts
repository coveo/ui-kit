import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {
  ControllerConfiguration,
  SSRControllerConfiguration,
} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

export interface UseCaseConfiguration {
  controllers: ControllerConfiguration[];
  actionLoaders: ActionLoaderConfiguration[];
  engine: EngineConfiguration;
}

export interface SSRUseCaseConfiguration {
  controllers: SSRControllerConfiguration[];
  engine: EngineConfiguration;
}
