import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildProductListing',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/product-listing/product-listing.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildPager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/pager/pager.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/pager/pager.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildResultsPerPage',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/results-per-page/results-per-page.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/results-per-page/results-per-page.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildSort',
    samplePaths: {},
    utils: [],
  },
  {
    initializer: 'buildFacetManager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/facet-manager/facet-manager.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/facet-manager/facet-manager.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildFacet',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/facet/facet.class.tsx',
        'packages/samples/headless-react/src/components/facet/facet-search.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/facet/facet.fn.tsx',
        'packages/samples/headless-react/src/components/facet/facet-search.tsx',
      ],
    },
  },
  {
    initializer: 'buildCategoryFacet',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/category-facet/category-facet.class.tsx',
        'packages/samples/headless-react/src/components/category-facet/category-facet-search.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/category-facet/category-facet.fn.tsx',
        'packages/samples/headless-react/src/components/category-facet/category-facet-search.tsx',
      ],
    },
  },
  {
    initializer: 'buildNumericFacet',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/numeric-facet/numeric-facet.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/numeric-facet/numeric-facet.fn.tsx',
      ],
    },
    utils: ['buildNumericRange'],
  },
  {
    initializer: 'buildDateFacet',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/date-facet/date-facet.class.tsx',
        'packages/samples/headless-react/src/components/relative-date-facet/relative-date-facet.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/date-facet/date-facet.fn.tsx',
        'packages/samples/headless-react/src/components/relative-date-facet/relative-date-facet.fn.tsx',
      ],
    },
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
