import {
  buildAutomaticFacetGenerator,
  buildBreadcrumbManager,
  buildCategoryFacet,
  buildCategoryFieldSuggestions,
  buildDateFacet,
  buildDateFilter,
  buildDateSortCriterion,
  buildDidYouMean,
  buildFacet,
  buildFacetManager,
  buildFieldSortCriterion,
  buildFieldSuggestions,
  buildFoldedResultList,
  buildHistoryManager,
  buildInstantResults,
  buildNotifyTrigger,
  buildNumericFacet,
  buildNumericFilter,
  buildNumericRange,
  buildPager,
  buildQueryError,
  buildQueryExpression,
  buildQuerySummary,
  buildQueryTrigger,
  buildRecentQueriesList,
  buildRecentResultsList,
  buildRedirectionTrigger,
  buildRelevanceInspector,
  buildRelevanceSortCriterion,
  buildResultList,
  buildResultsPerPage,
  buildSearchBox,
  buildSearchEngine,
  buildSearchStatus,
  buildSmartSnippet,
  buildSmartSnippetQuestionsList,
  buildSort,
  buildStaticFilterValue,
  buildTab,
  getSampleSearchEngineConfiguration,
  type AutomaticFacetGenerator as HeadlessAutomaticFacetGenerator,
  type BreadcrumbManager as HeadlessBreadcrumbManager,
  type CategoryFacet as HeadlessCategoryFacet,
  type CategoryFieldSuggestions as HeadlessCategoryFieldSuggestions,
  type DateFacet as HeadlessDateFacet,
  type DateFilter as HeadlessDateFilter,
  type DidYouMean as HeadlessDidYouMean,
  type Facet as HeadlessFacet,
  type FacetManager as HeadlessFacetManager,
  type FieldSuggestions as HeadlessFieldSuggestions,
  type FoldedResultList as HeadlessFoldedResultList,
  type HistoryManager as HeadlessHistoryManager,
  type InstantResults as HeadlessInstantResults,
  type NotifyTrigger as HeadlessNotifyTrigger,
  type NumericFacet as HeadlessNumericFacet,
  type NumericFilter as HeadlessNumericFilter,
  type Pager as HeadlessPager,
  type QueryError as HeadlessQueryError,
  type QuerySummary as HeadlessQuerySummary,
  type QueryTrigger as HeadlessQueryTrigger,
  type RecentQueriesList as HeadlessRecentQueriesList,
  type RecentResultsList as HeadlessRecentResultsList,
  type RedirectionTrigger as HeadlessRedirectionTrigger,
  type RelevanceInspector as HeadlessRelevanceInspector,
  type ResultList as HeadlessResultList,
  type ResultsPerPage as HeadlessResultsPerPage,
  type SearchBox as HeadlessSearchBox,
  type SearchStatus as HeadlessSearchStatus,
  type SmartSnippet as HeadlessSmartSnippet,
  type SmartSnippetQuestionsList as HeadlessSmartSnippetQuestionsList,
  type Sort as HeadlessSort,
  type Tab as HeadlessTab,
  loadQueryActions,
  loadSearchAnalyticsActions,
  type SearchAppState,
  type SearchEngine,
  type SortCriterion,
  SortOrder,
  type StandaloneSearchBoxAnalytics,
  type StaticFilterValue,
  type Unsubscribe,
} from '@coveo/headless';
import {Component} from 'react';
import {AutomaticFacetGenerator} from '../components/automatic-facet-generator/automatic-facet-generator.class';
import {AutomaticFacetGenerator as AutomaticFacetGeneratorFn} from '../components/automatic-facet-generator/automatic-facet-generator.fn';
import {BreadcrumbManager} from '../components/breadcrumb-manager/breadcrumb-manager.class';
import {BreadcrumbManager as BreadcrumbManagerFn} from '../components/breadcrumb-manager/breadcrumb-manager.fn';
import {CategoryFacet} from '../components/category-facet/category-facet.class';
import {CategoryFacet as CategoryFacetFn} from '../components/category-facet/category-facet.fn';
import {Context} from '../components/context/context';
import {DateFacet} from '../components/date-facet/date-facet.class';
import {DateFacet as DateFacetFn} from '../components/date-facet/date-facet.fn';
import {dateRanges} from '../components/date-facet/date-utils';
import {DateFilter} from '../components/date-filter/date-filter.class';
import {DateFilter as DateFilterFn} from '../components/date-filter/date-filter.fn';
import {DictionaryFieldContext} from '../components/dictionary-field-context/dictionary-field-context.fn';
import {DidYouMean} from '../components/did-you-mean/did-you-mean.class';
import {DidYouMean as DidYouMeanFn} from '../components/did-you-mean/did-you-mean.fn';
import {Facet} from '../components/facet/facet.class';
import {Facet as FacetFn} from '../components/facet/facet.fn';
import {FacetManager} from '../components/facet-manager/facet-manager.class';
import {FacetManager as FacetManagerFn} from '../components/facet-manager/facet-manager.fn';
import {CategoryFieldSuggestions} from '../components/field-suggestions/category-field/category-suggestions.class';
import {CategoryFieldSuggestions as CategorySuggestionsFn} from '../components/field-suggestions/category-field/category-suggestions.fn';
import {FieldSuggestions} from '../components/field-suggestions/specific-field/field-suggestions.class';
import {FieldSuggestions as FieldSuggestionsFn} from '../components/field-suggestions/specific-field/field-suggestions.fn';
import {FoldedResultList} from '../components/folded-result-list/folded-result-list.class';
import {FoldedResultList as FoldedResultListFn} from '../components/folded-result-list/folded-result-list.fn';
import {HistoryManager} from '../components/history-manager/history-manager.class';
import {HistoryManager as HistoryManagerFn} from '../components/history-manager/history-manager.fn';
import {InstantResults} from '../components/instant-results/instant-results.class';
import {InstantResults as InstantResultsFn} from '../components/instant-results/instant-results.fn';
import {NumericFacet} from '../components/numeric-facet/numeric-facet.class';
import {NumericFacet as NumericFacetFn} from '../components/numeric-facet/numeric-facet.fn';
import {NumericFilter} from '../components/numeric-filter/numeric-filter.class';
import {NumericFilter as NumericFilterFn} from '../components/numeric-filter/numeric-filter.fn';
import {Pager} from '../components/pager/pager.class';
import {Pager as PagerFn} from '../components/pager/pager.fn';
import {QueryError} from '../components/query-error/query-error.class';
import {QueryError as QueryErrorFn} from '../components/query-error/query-error.fn';
import {QuerySummary} from '../components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from '../components/query-summary/query-summary.fn';
import {RecentQueriesList} from '../components/recent-queries/recent-queries.class';
import {RecentQueriesList as RecentQueriesListFn} from '../components/recent-queries/recent-queries.fn';
import {RecentResultsList} from '../components/recent-results/recent-results.class';
import {RecentResultsList as RecentResultsListFn} from '../components/recent-results/recent-results.fn';
import {RelativeDateFacet} from '../components/relative-date-facet/relative-date-facet.class';
import {RelativeDateFacet as RelativeDateFacetFn} from '../components/relative-date-facet/relative-date-facet.fn';
import {relativeDateRanges} from '../components/relative-date-facet/relative-date-utils';
import {RelevanceInspector} from '../components/relevance-inspector/relevance-inspector.class';
import {RelevanceInspector as RelevanceInspectorFn} from '../components/relevance-inspector/relevance-inspector.fn';
import {ResultList} from '../components/result-list/result-list.class';
import {ResultList as ResultListFn} from '../components/result-list/result-list.fn';
import {ResultsPerPage} from '../components/results-per-page/results-per-page.class';
import {ResultsPerPage as ResultsPerPageFn} from '../components/results-per-page/results-per-page.fn';
import {SearchBox} from '../components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from '../components/search-box/search-box.fn';
import {SearchStatus} from '../components/search-status/search-status.class';
import {SearchStatus as SearchStatusFn} from '../components/search-status/search-status.fn';
import {SmartSnippet} from '../components/smart-snippet/smart-snippet.class';
import {SmartSnippet as SmartSnippetFn} from '../components/smart-snippet/smart-snippet.fn';
import {SmartSnippetQuestionsList} from '../components/smart-snippet-questions-list/smart-snippet-questions-list.class';
import {SmartSnippetQuestionsList as SmartSnippetQuestionsListFn} from '../components/smart-snippet-questions-list/smart-snippet-questions-list.fn';
import {Sort} from '../components/sort/sort.class';
import {Sort as SortFn} from '../components/sort/sort.fn';
import {standaloneSearchBoxStorageKey} from '../components/standalone-search-box/standalone-search-box-storage-key';
import {StaticFilter} from '../components/static-filter/static-filter.class';
import {StaticFilter as StaticFilterFn} from '../components/static-filter/static-filter.fn';
import {Tab} from '../components/tab/tab.class';
import {Tab as TabFn} from '../components/tab/tab.fn';
import {bindExecuteTrigger} from '../components/triggers/execute-trigger';
import {ExecuteTrigger} from '../components/triggers/execute-trigger.class';
import {NotifyTrigger} from '../components/triggers/notify-trigger.class';
import {NotifyTrigger as NotifyTriggerFn} from '../components/triggers/notify-trigger.fn';
import {QueryTrigger} from '../components/triggers/query-trigger.class';
import {QueryTrigger as QueryTriggerFn} from '../components/triggers/query-trigger.fn';
import {RedirectionTrigger} from '../components/triggers/redirection-trigger.class';
import {RedirectionTrigger as RedirectionTriggerFn} from '../components/triggers/redirection-trigger.fn';
import {bindUrlManager} from '../components/url-manager/url-manager';
import {AppContext} from '../context/engine';
import {Section} from '../layout/section';

declare global {
  interface Window {
    HEADLESS_STATE?: SearchAppState;
  }
}

const isServerSideRendered = globalThis.window?.HEADLESS_STATE;

const [KB, MB, GB] = [1e3, 1e6, 1e9];

/**
 * Formats a byte value into a human-readable file size string.
 * Uses decimal (base 10) units like the filesize library with {base: 10}.
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
  const base = 1000;

  const exponent = Math.floor(Math.log(Math.abs(bytes)) / Math.log(base));
  const value = bytes / base ** exponent;
  const unit = units[Math.min(exponent, units.length - 1)];

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: value >= 100 ? 0 : value >= 10 ? 1 : 2,
  });

  return `${formatter.format(value)} ${unit}`;
}

const criteria: [string, SortCriterion][] = [
  ['Relevance', buildRelevanceSortCriterion()],
  ['Date (Ascending)', buildDateSortCriterion(SortOrder.Ascending)],
  ['Date (Descending)', buildDateSortCriterion(SortOrder.Descending)],
  ['Size (Ascending)', buildFieldSortCriterion('size', SortOrder.Ascending)],
  ['Size (Descending)', buildFieldSortCriterion('size', SortOrder.Descending)],
];
const initialCriterion = criteria[0][1];

const resultsPerPageOptions = [10, 25, 50, 100];

export interface SearchPageProps {
  engine?: SearchEngine;
}

export class SearchPage extends Component {
  private engine!: SearchEngine;

  private readonly tabs: {
    all: HeadlessTab;
    messages: HeadlessTab;
    confluence: HeadlessTab;
  };
  private readonly breadcrumbManager: HeadlessBreadcrumbManager;
  private readonly searchBox: HeadlessSearchBox;
  private readonly didYouMean: HeadlessDidYouMean;
  private readonly searchStatus: HeadlessSearchStatus;
  private readonly queryError: HeadlessQueryError;
  private readonly querySummary: HeadlessQuerySummary;
  private readonly resultList: HeadlessResultList;
  private readonly foldedResultList: HeadlessFoldedResultList;
  private readonly facetManager: HeadlessFacetManager;
  private readonly geographyFacet: HeadlessCategoryFacet;
  private readonly objectTypeFacet: HeadlessFacet;
  private readonly fileSizeAutomaticNumericFacet: HeadlessNumericFacet;
  private readonly fileSizeManualNumericFacet: HeadlessNumericFacet;
  private readonly fileSizeNumericFilter: HeadlessNumericFilter;
  private readonly dateAutomaticDateFacet: HeadlessDateFacet;
  private readonly dateManualDateFacet: HeadlessDateFacet;
  private readonly dateRelativeDateFacet: HeadlessDateFacet;
  private readonly dateFilter: HeadlessDateFilter;
  private readonly sort: HeadlessSort;
  private readonly resultsPerPage: HeadlessResultsPerPage;
  private readonly pager: HeadlessPager;
  private readonly historyManager: HeadlessHistoryManager;
  private readonly relevanceInspector: HeadlessRelevanceInspector;
  private readonly redirectionTrigger: HeadlessRedirectionTrigger;
  private readonly queryTrigger: HeadlessQueryTrigger;
  private readonly notifyTrigger: HeadlessNotifyTrigger;
  private readonly smartSnippet: HeadlessSmartSnippet;
  private readonly smartSnippetQuestionsList: HeadlessSmartSnippetQuestionsList;
  private readonly fieldSuggestionsAuthor: HeadlessFieldSuggestions;
  private readonly categoryFieldSuggestions: HeadlessCategoryFieldSuggestions;
  private readonly recentQueriesList: HeadlessRecentQueriesList;
  private readonly recentResultsList: HeadlessRecentResultsList;
  private readonly instantResults: HeadlessInstantResults;
  private readonly searchboxInstantResults: HeadlessSearchBox;
  private readonly automaticFacetGenerator: HeadlessAutomaticFacetGenerator;

  private unsubscribeUrlManager!: Unsubscribe;

  private unsubscribeExecuteTrigger!: Unsubscribe;

  constructor(props: SearchPageProps) {
    super(props);

    this.initEngine(props);

    this.tabs = {
      all: buildTab(this.engine, {
        initialState: {isActive: true},
        options: {
          id: 'all',
          expression: '',
        },
      }),
      messages: buildTab(this.engine, {
        options: {
          id: 'messages',
          expression: this.messageExpression,
        },
      }),
      confluence: buildTab(this.engine, {
        options: {
          id: 'confluence',
          expression: this.confluenceExpression,
        },
      }),
    };

    this.breadcrumbManager = buildBreadcrumbManager(this.engine);

    this.searchBox = buildSearchBox(this.engine, {
      options: {numberOfSuggestions: 8},
    });

    this.didYouMean = buildDidYouMean(this.engine);

    this.searchStatus = buildSearchStatus(this.engine);

    this.queryError = buildQueryError(this.engine);

    this.querySummary = buildQuerySummary(this.engine);

    this.facetManager = buildFacetManager(this.engine);

    this.automaticFacetGenerator = buildAutomaticFacetGenerator(this.engine, {
      options: {
        desiredCount: 5,
      },
    });

    this.geographyFacet = buildCategoryFacet(this.engine, {
      options: {
        field: 'geographicalhierarchy',
        facetId: 'geographicalhierarchy-2',
      },
    });
    this.objectTypeFacet = buildFacet(this.engine, {
      options: {field: 'objecttype', facetId: 'objecttype-2'},
    });

    this.fileSizeAutomaticNumericFacet = buildNumericFacet(this.engine, {
      options: {
        field: 'size',
        facetId: 'size-3',
        generateAutomaticRanges: true,
      },
    });

    this.fileSizeManualNumericFacet = buildNumericFacet(this.engine, {
      options: {
        field: 'size',
        facetId: 'size-4',
        generateAutomaticRanges: false,
        currentValues: [
          buildNumericRange({start: 0, end: 5 * KB}),
          buildNumericRange({start: 5 * KB, end: 5 * MB}),
          buildNumericRange({start: 5 * MB, end: 5 * GB}),
        ],
      },
    });

    this.fileSizeNumericFilter = buildNumericFilter(this.engine, {
      options: {field: 'size', facetId: 'size-6'},
    });

    this.dateAutomaticDateFacet = buildDateFacet(this.engine, {
      options: {
        field: 'date',
        facetId: 'date-3',
        generateAutomaticRanges: true,
      },
    });
    this.dateManualDateFacet = buildDateFacet(this.engine, {
      options: {
        field: 'date',
        facetId: 'date-4',
        generateAutomaticRanges: false,
        currentValues: dateRanges,
      },
    });

    this.dateRelativeDateFacet = buildDateFacet(this.engine, {
      options: {
        field: 'date',
        facetId: 'date-5',
        generateAutomaticRanges: false,
        currentValues: relativeDateRanges,
      },
    });

    this.dateFilter = buildDateFilter(this.engine, {
      options: {field: 'date', facetId: 'date-7'},
    });

    this.sort = buildSort(this.engine, {
      initialState: {criterion: initialCriterion},
    });

    this.resultList = buildResultList(this.engine);

    this.foldedResultList = buildFoldedResultList(this.engine);

    this.resultsPerPage = buildResultsPerPage(this.engine, {
      initialState: {numberOfResults: resultsPerPageOptions[0]},
    });

    this.pager = buildPager(this.engine, {options: {numberOfPages: 6}});

    this.historyManager = buildHistoryManager(this.engine);

    this.relevanceInspector = buildRelevanceInspector(this.engine);

    this.redirectionTrigger = buildRedirectionTrigger(this.engine);

    this.queryTrigger = buildQueryTrigger(this.engine);

    this.notifyTrigger = buildNotifyTrigger(this.engine);

    this.smartSnippet = buildSmartSnippet(this.engine);

    this.smartSnippetQuestionsList = buildSmartSnippetQuestionsList(
      this.engine
    );

    this.fieldSuggestionsAuthor = buildFieldSuggestions(this.engine, {
      options: {facet: {field: 'author', facetId: 'author-2'}},
    });

    this.categoryFieldSuggestions = buildCategoryFieldSuggestions(this.engine, {
      options: {
        facet: {
          field: 'geographicalhierarchy',
          facetId: 'geographicalhierarchy-3',
        },
      },
    });

    this.recentQueriesList = buildRecentQueriesList(this.engine);

    this.recentResultsList = buildRecentResultsList(this.engine);

    const sharedIdBetweenSearchboxAndInstantResult = 'sample-instant-results';

    this.instantResults = buildInstantResults(this.engine, {
      options: {
        maxResultsPerQuery: 5,
        searchBoxId: sharedIdBetweenSearchboxAndInstantResult,
      },
    });
    this.searchboxInstantResults = buildSearchBox(this.engine, {
      options: {
        id: sharedIdBetweenSearchboxAndInstantResult,
      },
    });
  }

  initEngine(props: SearchPageProps) {
    if (props.engine) {
      this.engine = props.engine;
      return;
    }

    this.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
      preloadedState: window.HEADLESS_STATE,
    });
  }

  componentDidMount() {
    // Search parameters, defined in the url's hash, are restored once `UrlManager` is registered.
    // Beware not to restore search parameters until all components are registered,
    // otherwise some components such as facets may not work when the page loads.
    // In this sample, `SearchPage.componentDidMount` happens to be executed after
    // all components are registered, but depending on your implementation this may
    // not be your case.
    this.unsubscribeUrlManager = bindUrlManager(this.engine);

    this.unsubscribeExecuteTrigger = bindExecuteTrigger(this.engine);

    // A search should not be executed until the search parameters are restored.
    this.executeInitialSearch();
  }

  componentWillUnmount() {
    this.unsubscribeUrlManager();
    this.unsubscribeExecuteTrigger();
  }

  private get messageExpression() {
    return buildQueryExpression()
      .addStringField({
        field: 'objecttype',
        operator: 'isExactly',
        values: ['Message'],
      })
      .toQuerySyntax();
  }

  private get confluenceExpression() {
    return buildQueryExpression()
      .addStringField({
        field: 'connectortype',
        operator: 'isExactly',
        values: ['Confluence2Crawler'],
      })
      .addStringField({
        field: 'documenttype',
        operator: 'isExactly',
        values: ['Space'],
        negate: true,
      })
      .toQuerySyntax();
  }

  private executeInitialSearch() {
    if (isServerSideRendered) {
      const {logInterfaceLoad} = loadSearchAnalyticsActions(this.engine);
      this.engine.dispatch(logInterfaceLoad());
      return;
    }

    const data = localStorage.getItem(standaloneSearchBoxStorageKey);

    if (data) {
      this.executeFirstSearchAfterStandaloneSearchBoxRedirect(data);
      return;
    }

    this.engine.executeFirstSearch();
  }

  private executeFirstSearchAfterStandaloneSearchBoxRedirect(data: string) {
    localStorage.removeItem(standaloneSearchBoxStorageKey);
    const parsed: {
      value: string;
      analytics: StandaloneSearchBoxAnalytics;
    } = JSON.parse(data);
    const {value, analytics} = parsed;
    const {updateQuery} = loadQueryActions(this.engine);

    this.engine.dispatch(updateQuery({q: value}));
    this.engine.executeFirstSearchAfterStandaloneSearchBoxRedirect(analytics);
  }

  private get staticFilterValues(): StaticFilterValue[] {
    const youtubeExpression = buildQueryExpression()
      .addStringField({
        field: 'filetype',
        operator: 'isExactly',
        values: ['youtubevideo'],
      })
      .toQuerySyntax();

    const dropboxExpression = buildQueryExpression()
      .addStringField({
        field: 'connectortype',
        operator: 'isExactly',
        values: ['DropboxCrawler'],
      })
      .addStringField({
        field: 'objecttype',
        operator: 'isExactly',
        values: ['File'],
      })
      .toQuerySyntax();

    return [
      buildStaticFilterValue({
        caption: 'Youtube',
        expression: youtubeExpression,
      }),
      buildStaticFilterValue({
        caption: 'Dropbox',
        expression: dropboxExpression,
      }),
    ];
  }

  render() {
    return (
      <div>
        <AppContext.Provider value={{engine: this.engine}}>
          <Context />
          <DictionaryFieldContext />
          <Section title="tabs">
            <nav>
              <Tab id="all" expression="" active>
                All
              </Tab>
              <Tab id="messages" expression={this.messageExpression}>
                Messages
              </Tab>
              <Tab id="confluence" expression={this.confluenceExpression}>
                Confluence
              </Tab>
            </nav>
            <nav>
              <TabFn controller={this.tabs.all}>All</TabFn>
              <TabFn controller={this.tabs.messages}>Messages</TabFn>
              <TabFn controller={this.tabs.confluence}>Confluence</TabFn>
            </nav>
          </Section>
          <Section title="breadcrumb-manager">
            <BreadcrumbManager />
            <BreadcrumbManagerFn controller={this.breadcrumbManager} />
          </Section>
          <Section title="search-box">
            <SearchBox />
            <SearchBoxFn controller={this.searchBox} />
          </Section>
          <Section title="field-suggestions">
            <FieldSuggestions field="author" facetId="author-1" />
            <FieldSuggestionsFn controller={this.fieldSuggestionsAuthor} />
          </Section>
          <Section title="category-field-suggestions">
            <CategoryFieldSuggestions
              field="geographicalhierarchy"
              facetId="geographicalhierarchy-4"
            />
            <CategorySuggestionsFn controller={this.categoryFieldSuggestions} />
          </Section>
          <Section title="did-you-mean">
            <DidYouMean />
            <DidYouMeanFn controller={this.didYouMean} />
          </Section>
          <Section title="search-status">
            <SearchStatus />
            <SearchStatusFn controller={this.searchStatus} />
          </Section>
          <Section title="query-error">
            <QueryError />
            <QueryErrorFn controller={this.queryError} />
          </Section>
          <Section title="query-summary">
            <QuerySummary />
            <QuerySummaryFn controller={this.querySummary} />
          </Section>
          <Section title="static filter">
            <StaticFilter id="filetypes-a" values={this.staticFilterValues} />
            <StaticFilterFn id="filetypes-b" values={this.staticFilterValues} />
          </Section>
          <Section title="facet">
            <AutomaticFacetGenerator desiredCount={5}></AutomaticFacetGenerator>
            <FacetManager>
              <CategoryFacet
                field="geographicalhierarchy"
                facetId="geographicalhierarchy-1"
              />
              <Facet field="author" facetId="author-1" />
              <NumericFacet
                format={(bytes) => formatFileSize(bytes)}
                field="size"
                facetId="size-1"
                generateAutomaticRanges={true}
              />
              <NumericFacet
                format={(bytes) => formatFileSize(bytes)}
                field="size"
                facetId="size-2"
                generateAutomaticRanges={false}
                currentValues={[
                  buildNumericRange({start: 0, end: 5 * KB}),
                  buildNumericRange({start: 5 * KB, end: 5 * MB}),
                  buildNumericRange({start: 5 * MB, end: 5 * GB}),
                ]}
              />
              <NumericFilter field="size" facetId="size-5" />
              <DateFacet
                field="date"
                facetId="date-1"
                generateAutomaticRanges={true}
              />
              <DateFacet
                field="date"
                facetId="date-2"
                generateAutomaticRanges={false}
                currentValues={dateRanges}
              />
              <RelativeDateFacet
                field="date"
                facetId="date-6"
                generateAutomaticRanges={false}
                currentValues={relativeDateRanges}
              />
              <DateFilter field="date" facetId="date-3" />
            </FacetManager>
            <AutomaticFacetGeneratorFn
              controller={this.automaticFacetGenerator}
            ></AutomaticFacetGeneratorFn>
            <FacetManagerFn controller={this.facetManager}>
              <CategoryFacetFn controller={this.geographyFacet} />
              <FacetFn controller={this.objectTypeFacet} />
              <NumericFacetFn
                controller={this.fileSizeAutomaticNumericFacet}
                format={(bytes) => formatFileSize(bytes)}
              />
              <NumericFacetFn
                controller={this.fileSizeManualNumericFacet}
                format={(bytes) => formatFileSize(bytes)}
              />
              <NumericFilterFn controller={this.fileSizeNumericFilter} />
              <DateFacetFn controller={this.dateAutomaticDateFacet} />
              <DateFacetFn controller={this.dateManualDateFacet} />
              <RelativeDateFacetFn controller={this.dateRelativeDateFacet} />
              <DateFilterFn controller={this.dateFilter} />
            </FacetManagerFn>
          </Section>
          <Section title="sort">
            <Sort criteria={criteria} initialCriterion={initialCriterion} />
            <SortFn controller={this.sort} criteria={criteria} />
          </Section>
          <Section title="result-list">
            <ResultList />
            <ResultListFn controller={this.resultList} />
          </Section>
          <Section title="smart-snippet">
            <SmartSnippet />
            <SmartSnippetFn controller={this.smartSnippet} />
          </Section>
          <Section title="smart-snippet-questions-list">
            <SmartSnippetQuestionsList />
            <SmartSnippetQuestionsListFn
              controller={this.smartSnippetQuestionsList}
            />
          </Section>

          <Section title="folded-result-list">
            <FoldedResultList />
            <FoldedResultListFn controller={this.foldedResultList} />
          </Section>
          <Section title="results-per-page">
            <ResultsPerPage options={resultsPerPageOptions} />
            <ResultsPerPageFn
              controller={this.resultsPerPage}
              options={resultsPerPageOptions}
            />
          </Section>
          <Section title="pager">
            <Pager />
            <PagerFn controller={this.pager} />
          </Section>
          <Section title="history-manager">
            <HistoryManager />
            <HistoryManagerFn controller={this.historyManager} />
          </Section>
          <Section title="relevance-inspector">
            <RelevanceInspector />
            <RelevanceInspectorFn controller={this.relevanceInspector} />
          </Section>
          <Section title="redirection-trigger">
            <RedirectionTrigger></RedirectionTrigger>
            <RedirectionTriggerFn
              controller={this.redirectionTrigger}
            ></RedirectionTriggerFn>
          </Section>
          <Section title="query-trigger">
            <QueryTrigger></QueryTrigger>
            <QueryTriggerFn controller={this.queryTrigger}></QueryTriggerFn>
          </Section>
          <Section title="execute-trigger">
            <ExecuteTrigger></ExecuteTrigger>
          </Section>
          <Section title="notify-trigger">
            <NotifyTrigger></NotifyTrigger>
            <NotifyTriggerFn controller={this.notifyTrigger}></NotifyTriggerFn>
          </Section>
          <Section title="recent-queries-list">
            <RecentQueriesList maxLength={10} />
            <RecentQueriesListFn controller={this.recentQueriesList} />
          </Section>
          <Section title="recent-results-list">
            <RecentResultsList maxLength={10} />
            <RecentResultsListFn controller={this.recentResultsList} />
          </Section>
          <Section title="instant-results-list">
            <InstantResults />
            <InstantResultsFn
              controllerInstantResults={this.instantResults}
              controllerSearchbox={this.searchboxInstantResults}
            />
          </Section>
        </AppContext.Provider>
      </div>
    );
  }
}
