import {ActionLoaderConfiguration} from '../src/headless-export-resolvers/action-loader-resolver';
import {ControllerConfiguration} from '../src/headless-export-resolvers/controller-resolver';
import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';

const controllers: ControllerConfiguration[] = [
  {
    initializer: 'defineFacet',
    samplePaths: {},
  },
  {
    initializer: 'defineContext',
    samplePaths: {},
  },
  {
    initializer: 'defineDictionaryFieldContext',
    samplePaths: {},
  },
  {
    initializer: 'defineBreadcrumbManager',
    samplePaths: {},
  },
  {
    initializer: 'defineDidYouMean',
    samplePaths: {},
  },
  {
    initializer: 'defineFacetManager',
    samplePaths: {},
  },
  {
    initializer: 'defineAutomaticFacetGenerator',
    samplePaths: {},
  },
  {
    initializer: 'defineCategoryFacet',
    samplePaths: {},
  },
  {
    initializer: 'defineDateFacet',
    samplePaths: {},
  },
  {
    initializer: 'defineDateFilter',
    samplePaths: {},
  },
  {
    initializer: 'defineNumericFacet',
    samplePaths: {},
  },
  {
    initializer: 'defineNumericFilter',
    samplePaths: {},
  },
  {
    initializer: 'defineCategoryFieldSuggestions',
    samplePaths: {},
  },
  {
    initializer: 'defineFieldSuggestions',
    samplePaths: {},
  },
  {
    initializer: 'defineFoldedResultList',
    samplePaths: {},
  },
  {
    initializer: 'defineHistoryManager',
    samplePaths: {},
  },
  {
    initializer: 'defineInstantResults',
    samplePaths: {},
  },
  {
    initializer: 'definePager',
    samplePaths: {},
  },
  {
    initializer: 'defineQueryError',
    samplePaths: {},
  },
  {
    initializer: 'defineQuerySummary',
    samplePaths: {},
  },
  {
    initializer: 'defineQuickview',
    samplePaths: {},
  },
  {
    initializer: 'defineRecentQueriesList',
    samplePaths: {},
  },
  {
    initializer: 'defineRelevanceInspector',
    samplePaths: {},
  },
  {
    initializer: 'defineResultList',
    samplePaths: {},
  },
  {
    initializer: 'defineResultsPerPage',
    samplePaths: {},
  },
  {
    initializer: 'defineSearchBox',
    samplePaths: {},
  },
  {
    initializer: 'defineSearchParameterManager',
    samplePaths: {},
  },
  {
    initializer: 'defineSearchStatus',
    samplePaths: {},
  },
  {
    initializer: 'defineSmartSnippet',
    samplePaths: {},
  },
  {
    initializer: 'defineSmartSnippetQuestionsList',
    samplePaths: {},
  },
  {
    initializer: 'defineSort',
    samplePaths: {},
  },
  {
    initializer: 'defineStandaloneSearchBox',
    samplePaths: {},
  },
  {
    initializer: 'defineStaticFilter',
    samplePaths: {},
  },
  {
    initializer: 'defineTab',
    samplePaths: {},
  },
  {
    initializer: 'defineNotifyTrigger',
    samplePaths: {},
  },
  {
    initializer: 'defineExecuteTrigger',
    samplePaths: {},
  },
  {
    initializer: 'defineQueryTrigger',
    samplePaths: {},
  },
  {
    initializer: 'defineRedirectionTrigger',
    samplePaths: {},
  },
  {
    initializer: 'defineRecentResultsList',
    samplePaths: {},
  },
];

const actionLoaders: ActionLoaderConfiguration[] = [];

const engine: EngineConfiguration = {
  initializer: 'defineSearchEngine',
};

export const ssrSearchUseCase = {controllers, actionLoaders, engine};
