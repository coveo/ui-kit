import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildContext',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListing',
    samplePaths: {},
  },
  {
    initializer: 'buildCart',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingBreadcrumbManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingCategoryFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingDateFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingFacetGenerator',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingNumericFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingRegularFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingPagination',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListingSort',
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
    initializer: 'buildSearchCategoryFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchDateFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchFacetGenerator',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchNumericFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchRegularFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchPagination',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchSort',
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
];

const actionLoaders: ActionLoaderConfiguration[] = [];

const engine: EngineConfiguration = {
  initializer: 'buildCommerceEngine',
};

export const commerceUseCase = {controllers, actionLoaders, engine};
