import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver.js';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver.js';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver.js';

const controllers: ControllerConfiguration[] = [];

const actionLoaders: ActionLoaderConfiguration[] = [];

const engine: EngineConfiguration = {
  initializer: 'buildCommerceEngine',
};

export const commerceUseCase = {controllers, actionLoaders, engine};
