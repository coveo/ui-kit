import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildContext',
    samplePaths: {},
  },
  {
    initializer: 'buildCart',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListing',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingBreadcrumbManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingUrlManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductView',
    samplePaths: {},
  },
  {
    initializer: 'buildRecommendations',
    samplePaths: {},
  },
  {
    initializer: 'buildSearch',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchBreadcrumbManager',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchUrlManager',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchBox',
    samplePaths: {},
  },
  {
    initializer: 'buildRelevanceSortCriterion',
    samplePaths: {},
  },
  {
    initializer: 'buildFieldsSortCriterion',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadProductListingActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildCommerceEngine',
};

export const commerceUseCase = {controllers, actionLoaders, engine};
