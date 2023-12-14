import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';
import {SSRControllerConfiguration} from '../src/headless-export-resolvers/ssr-controller-resolver';

export interface UseCaseConfiguration {
  controllers: ControllerConfiguration[];
  actionLoaders: ActionLoaderConfiguration[];
  engine: EngineConfiguration;
}

export interface SSRUseCaseConfiguration {
  controllers: SSRControllerConfiguration[];
  engine: EngineConfiguration;
}
