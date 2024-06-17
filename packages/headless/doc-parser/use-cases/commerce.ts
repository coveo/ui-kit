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
    initializer: 'buildFieldSuggestionsGenerator',
    samplePaths: {},
  },
  {
    initializer: 'buildInstantProducts',
    samplePaths: {},
  },
  {
    initializer: 'buildNotifyTrigger',
    samplePaths: {},
  },
  {
    initializer: 'buildProductListing',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/commerce/product-listing.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildProductTemplatesManager',
    samplePaths: {},
  },
  {
    initializer: 'buildProductView',
    samplePaths: {},
  },
  {
    initializer: 'buildQueryTrigger',
    samplePaths: {},
  },
  {
    initializer: 'buildRecommendations',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/commerce/recommendations.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildRedirectionTrigger',
    samplePaths: {},
  },
  {
    initializer: 'buildRecentQueriesList',
    samplePaths: {},
  },
  {
    initializer: 'buildSearch',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/commerce/search.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildSearchBox',
    samplePaths: {},
  },
  {
    initializer: 'buildStandaloneSearchBox',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadProductListingActions',
  },
  {
    initializer: 'loadQuerySuggestActions',
  },
  {
    initializer: 'loadConfigurationActions',
  },
  {
    initializer: 'loadQueryActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildCommerceEngine',
};

export const commerceUseCase = {controllers, actionLoaders, engine};
