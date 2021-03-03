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
    initializer: 'buildFacet',
    samplePaths: {
      react_class: [
        'packages/samples/headless-react/src/components/facet/facet.class.tsx',
      ],
      react_fn: [
        'packages/samples/headless-react/src/components/facet/facet.fn.tsx',
      ],
    },
  },
  {
    initializer: 'buildNumericFacet',
    samplePaths: {},
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
  // {
  //   initializer: 'buildCategoryFacet',
  //   samplePaths: {},
  // },
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
