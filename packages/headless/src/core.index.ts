/**
 * @module Core
 */

export type {
  buildCoreContext,
  Context,
  ContextState,
} from './controllers/core/context/headless-core-context.ts';

export type {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanState,
} from './controllers/core/did-you-mean/headless-core-did-you-mean.ts';

export type {
  CategoryFacet,
  CategoryFacetState,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/core/facets/category-facet/headless-core-category-facet.js';

export type {
  buildCoreDateFacet,
  DateFacet,
  DateFacetState,
} from './controllers/core/facets/range-facet/date-facet/headless-core-date-facet.js';

export type {
  DateFilter,
  DateFilterState,
} from './controllers/core/facets/range-facet/date-facet/headless-core-date-filter.js';

export type {
  Facet,
  FacetState,
  CoreFacet,
  CoreFacetState,
} from './controllers/core/facets/facet/headless-core-facet.js';

export type {
  buildCoreNumericFacet,
  NumericFacet,
  NumericFacetState,
} from './controllers/core/facets/range-facet/numeric-facet/headless-core-numeric-facet.js';

export type {
  NumericFilter,
  NumericFilterState,
} from './controllers/core/facets/range-facet/numeric-facet/headless-core-numeric-filter.js';

export type {
  buildCoreFacetManager,
  FacetManager,
  FacetManagerState,
} from './controllers/core/facet-manager/headless-core-facet-manager.js';

export type {
  CoreBreadcrumbManager,
  CoreBreadcrumbManagerState,
} from './controllers/breadcrumb-manager/headless-breadcrumb-manager.js';

export type {
  buildCoreFoldedResultList,
  FoldedResultList,
  FoldedResultListState,
} from './controllers/core/folded-result-list/headless-core-folded-result-list.js';

export type {
  CoreQuickviewState,
  CoreQuickview,
} from './controllers/quickview/headless-quickview.js';

export type {
  GeneratedAnswer,
  GeneratedAnswerState,
} from './controllers/core/generated-answer/headless-core-generated-answer.js';

export type {InteractiveCitation} from './controllers/core/generated-answer/headless-core-interactive-citation.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from './controllers/core/triggers/headless-core-notify-trigger.js';

export type {
  Pager,
  PagerState,
} from './controllers/core/pager/headless-core-pager.js';

export type {
  QueryError,
  QueryErrorState,
} from './controllers/core/query-error/headless-core-query-error.js';

export type {
  QuerySummary,
  QuerySummaryState,
} from './controllers/core/query-summary/headless-core-query-summary.js';

export type {
  QueryTrigger,
  QueryTriggerState,
} from './controllers/core/triggers/headless-core-query-trigger.js';

export type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from './controllers/core/triggers/headless-core-redirection-trigger.js';

export type {
  ResultList,
  ResultListState,
} from './controllers/core/result-list/headless-core-result-list.js';

export type {
  ResultsPerPage,
  ResultsPerPageState,
} from './controllers/core/results-per-page/headless-core-results-per-page.js';

export type {SearchBoxState} from './controllers/core/search-box/headless-core-search-box.js';

export type {
  SearchParameterManager,
  SearchParameterManagerState,
} from './controllers/core/search-parameter-manager/headless-core-search-parameter-manager.js';

export type {
  SmartSnippet,
  SmartSnippetState,
} from './controllers/core/smart-snippet/headless-core-smart-snippet.js';

export type {
  Sort,
  SortState,
} from './controllers/core/sort/headless-core-sort.js';

export type {
  SearchStatus,
  SearchStatusState,
} from './controllers/core/status/headless-core-status.js';

export type {Tab, TabState} from './controllers/core/tab/headless-core-tab.js';

export type {
  TabManager,
  TabManagerState,
} from './controllers/core/tab-manager/headless-core-tab-manager.js';
