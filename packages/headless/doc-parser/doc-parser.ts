import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ActionLoaderConfiguration,
  resolveActionLoader,
} from './src/headless-export-resolvers/action-loader-resolver';
import {
  ControllerConfiguration,
  resolveController,
} from './src/headless-export-resolvers/controller-resolver';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const controllerConfiguration: ControllerConfiguration[] = [
  {
    initializer: 'buildHistoryManager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/history-manager/history-manager.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/history-manager/history-manager.fn.tsx',
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
    initializer: 'buildSort',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/sort/sort.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/sort/sort.fn.tsx',
      ],
    },
    utils: [],
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
    samplePaths: {},
    utils: ['buildDateRange'],
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
    initializer: 'buildContext',
    samplePaths: {
      react_fn: [
        'packages/samples/headless-react/src/components/context/context.ts',
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
    initializer: 'buildDidYouMean',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/did-you-mean/did-you-mean.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/did-you-mean/did-you-mean.fn.tsx',
      ],
    },
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
    initializer: 'buildQueryError',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/query-error/query-error.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/query-error/query-error.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildBreadcrumbManager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/breadcrumb-manager/breadcrumb-manager.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/breadcrumb-manager/breadcrumb-manager.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildRecommendationList',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/recommendation-list/recommendation-list.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/recommendation-list/recommendation-list.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildQuerySummary',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/query-summary/query-summary.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/query-summary/query-summary.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildResultList',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/result-list/result-list.class.tsx',
        'packages/samples/headless-react/src/components/result-list/result-link.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/result-list/result-list.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildTab',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/tab/tab.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/tab/tab.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildSearchStatus',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/search-status/search-status.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/search-status/search-status.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildCartRecommendationsList',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchBox',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/search-box/search-box.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/search-box/search-box.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildStandaloneSearchBox',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/standalone-search-box/standalone-search-box.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/standalone-search-box/standalone-search-box.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildInteractiveResult',
    samplePaths: {
      react_class: [],
      react_fn: [
        'packages/samples/headless-react/src/components/result-list/result-link.tsx',
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
    initializer: 'buildRelevanceInspector',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/relevance-inspector/relevance-inspector.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/relevance-inspector/relevance-inspector.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildSearchParameterManager',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/search-parameter-manager/search-parameter-manager.ts',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/search-parameter-manager/search-parameter-manager.ts',
      ],
    },
  },
  {
    initializer: 'buildQuickview',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/quickview/quickview.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/quickview/quickview.fn.tsx',
      ],
    },
  },
];

const actionLoaderConfiguration: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadSearchActions',
  },
  {
    initializer: 'loadAdvancedSearchQueryActions',
  },
  {
    initializer: 'loadConfigurationActions',
  },
  {
    initializer: 'loadContextActions',
  },
  {
    initializer: 'loadDebugActions',
  },
];

const controllers = controllerConfiguration.map((controller) =>
  resolveController(entryPoint, controller)
);
const actionLoaders = actionLoaderConfiguration.map((loader) =>
  resolveActionLoader(entryPoint, loader)
);

const result = {controllers, actionLoaders};

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
