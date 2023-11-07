import {EngineConfiguration} from '../src/headless-export-resolvers/engine-resolver';
import {SSRControllerConfiguration} from '../src/headless-export-resolvers/ssr-controller-resolver';
import {SSRUseCaseConfiguration} from './use-case-configuration';

const controllers: SSRControllerConfiguration[] = [
  {
    initializer: 'defineFacet',
  },
  {
    initializer: 'defineContext',
  },
  {
    initializer: 'defineDictionaryFieldContext',
  },
  {
    initializer: 'defineBreadcrumbManager',
  },
  {
    initializer: 'defineDidYouMean',
  },
  {
    initializer: 'defineFacetManager',
  },
  {
    initializer: 'defineAutomaticFacetGenerator',
  },
  {
    initializer: 'defineCategoryFacet',
  },
  {
    initializer: 'defineDateFacet',
  },
  {
    initializer: 'defineDateFilter',
  },
  {
    initializer: 'defineNumericFacet',
  },
  {
    initializer: 'defineNumericFilter',
  },
  {
    initializer: 'defineCategoryFieldSuggestions',
  },
  {
    initializer: 'defineFieldSuggestions',
  },
  {
    initializer: 'defineFoldedResultList',
  },
  {
    initializer: 'defineHistoryManager',
  },
  {
    initializer: 'defineInstantResults',
  },
  {
    initializer: 'definePager',
  },
  {
    initializer: 'defineQueryError',
  },
  {
    initializer: 'defineQuerySummary',
  },
  {
    initializer: 'defineQuickview',
  },
  {
    initializer: 'defineRecentQueriesList',
  },
  {
    initializer: 'defineRelevanceInspector',
  },
  {
    initializer: 'defineResultList',
  },
  {
    initializer: 'defineResultsPerPage',
  },
  {
    initializer: 'defineSearchBox',
  },
  {
    initializer: 'defineSearchParameterManager',
  },
  {
    initializer: 'defineSearchStatus',
  },
  {
    initializer: 'defineSmartSnippet',
  },
  {
    initializer: 'defineSmartSnippetQuestionsList',
  },
  {
    initializer: 'defineSort',
  },
  {
    initializer: 'defineStandaloneSearchBox',
  },
  {
    initializer: 'defineStaticFilter',
  },
  {
    initializer: 'defineTab',
  },
  {
    initializer: 'defineNotifyTrigger',
  },
  {
    initializer: 'defineExecuteTrigger',
  },
  {
    initializer: 'defineQueryTrigger',
  },
  {
    initializer: 'defineRedirectionTrigger',
  },
  {
    initializer: 'defineRecentResultsList',
  },
];

const engine: EngineConfiguration = {
  initializer: 'defineSearchEngine',
};

export const ssrSearchUseCase: SSRUseCaseConfiguration = {controllers, engine};
