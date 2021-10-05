import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildProductListing',
    samplePaths: {},
  },
  {
    initializer: 'buildPager',
    samplePaths: {},
  },
  {
    initializer: 'buildResultsPerPage',
    samplePaths: {},
  },
  {
    initializer: 'buildSort',
    samplePaths: {},
  },
  {
    initializer: 'buildFacetManager',
    samplePaths: {},
  },
  {
    initializer: 'buildFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildCategoryFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildNumericFacet',
    samplePaths: {},
    utils: ['buildNumericRange'],
  },
  {
    initializer: 'buildDateFacet',
    samplePaths: {},
    utils: ['buildDateRange'],
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadProductListingActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildProductListingEngine',
};

export const productListingUseCase = {controllers, actionLoaders, engine};
