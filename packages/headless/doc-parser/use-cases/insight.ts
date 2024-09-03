import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'buildFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildSort',
    samplePaths: {},
    utils: [],
  },
  {
    initializer: 'buildNumericFacet',
    samplePaths: {},
    utils: ['buildNumericRange'],
  },
  {
    initializer: 'buildNumericFilter',
    samplePaths: {},
  },
  {
    initializer: 'buildDateFacet',
    samplePaths: {},
    utils: ['buildDateRange'],
  },
  {
    initializer: 'buildDateFilter',
    samplePaths: {},
  },
  {
    initializer: 'buildPager',
    samplePaths: {},
  },
  {
    initializer: 'buildCategoryFacet',
    samplePaths: {},
  },
  {
    initializer: 'buildDidYouMean',
    samplePaths: {},
  },
  {
    initializer: 'buildFacetManager',
    samplePaths: {},
  },
  {
    initializer: 'buildBreadcrumbManager',
    samplePaths: {},
  },
  {
    initializer: 'buildQuerySummary',
    samplePaths: {},
  },
  {
    initializer: 'buildResultList',
    samplePaths: {},
  },
  {
    initializer: 'buildTab',
    samplePaths: {},
    utils: [],
  },
  {
    initializer: 'buildSearchStatus',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchBox',
    samplePaths: {},
  },
  {
    initializer: 'buildResultsPerPage',
    samplePaths: {},
  },
  {
    initializer: 'buildSearchParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'buildQuickview',
    samplePaths: {},
  },
  {
    initializer: 'buildInsightInterface',
    samplePaths: {},
  },
  {
    initializer: 'buildAttachToCase',
    samplePaths: {},
  },
  {
    initializer: 'buildFoldedResultList',
    samplePaths: {},
  },
  {
    initializer: 'buildInteractiveResult',
    samplePaths: {},
  },
  {
    initializer: 'buildFacetConditionsManager',
    samplePaths: {},
  },
  {
    initializer: 'buildSmartSnippet',
    samplePaths: {},
  },
  {
    initializer: 'buildSmartSnippetQuestionsList',
    samplePaths: {},
  },
  {
    initializer: 'buildQueryError',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [
  {
    initializer: 'loadInsightInterfaceActions',
  },
  {
    initializer: 'loadInsightSearchActions',
  },
  {
    initializer: 'loadQuerySetActions',
  },
  {
    initializer: 'loadInsightAnalyticsActions',
  },
  {
    initializer: 'loadDateFacetSetActions',
  },
  {
    initializer: 'loadNumericFacetSetActions',
  },
  {
    initializer: 'loadRecentResultsActions',
  },
  {
    initializer: 'loadDateFacetSetActions',
  },
  {
    initializer: 'loadCaseContextActions',
  },
  {
    initializer: 'loadInsightSearchAnalyticsActions',
  },
  {
    initializer: 'loadFieldActions',
  },
  {
    initializer: 'loadAttachedResultsActions',
  },
  {
    initializer: 'loadGenericAnalyticsActions',
  },
  {
    initializer: 'loadInsightUserActionsActions',
  },
];

const engine: EngineConfiguration = {
  initializer: 'buildInsightEngine',
};

export const insightUseCase = {controllers, actionLoaders, engine};
