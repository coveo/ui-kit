import {ApiModel} from '@microsoft/api-extractor-model';
import {writeFileSync} from 'fs';
import {
  ControllerConfiguration,
  resolveController,
} from './src/controller-resolver';

const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage('temp/headless.api.json');
const entryPoint = apiPackage.entryPoints[0];

const controllers: ControllerConfiguration[] = [
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
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/date-facet/date-facet.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/date-facet/date-facet.fn.tsx',
      ],
    },
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
    samplePaths: {},
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
    samplePaths: {},
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
];

const result = controllers.map((controller) =>
  resolveController(entryPoint, controller)
);

writeFileSync('dist/parsed_doc.json', JSON.stringify(result, null, 2));
