import './SearchPage.css';
import {Component} from 'react';
import filesize from 'filesize';
import {AppContext} from '../context/engine';

import {RecommendationList} from '../components/recommendation-list/recommendation-list.class';
import {RecommendationList as RecommendationListFn} from '../components/recommendation-list/recommendation-list.fn';
import {Tab} from '../components/tab/tab.class';
import {Tab as TabFn} from '../components/tab/tab.fn';
import {BreadcrumbManager} from '../components/breadcrumb-manager/breadcrumb-manager.class';
import {BreadcrumbManager as BreadcrumbManagerFn} from '../components/breadcrumb-manager/breadcrumb-manager.fn';
import {SearchBox} from '../components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from '../components/search-box/search-box.fn';
import {DidYouMean} from '../components/did-you-mean/did-you-mean.class';
import {DidYouMean as DidYouMeanFn} from '../components/did-you-mean/did-you-mean.fn';
import {SearchStatus} from '../components/search-status/search-status.class';
import {SearchStatus as SearchStatusFn} from '../components/search-status/search-status.fn';
import {QueryError} from '../components/query-error/query-error.class';
import {QueryError as QueryErrorFn} from '../components/query-error/query-error.fn';
import {Sort} from '../components/sort/sort.class';
import {Sort as SortFn} from '../components/sort/sort.fn';
import {ResultList} from '../components/result-list/result-list.class';
import {ResultList as ResultListFn} from '../components/result-list/result-list.fn';
import {FoldedResultList} from '../components/folded-result-list/folded-result-list.class';
import {FoldedResultList as FoldedResultListFn} from '../components/folded-result-list/folded-result-list.fn';
import {Pager} from '../components/pager/pager.class';
import {Pager as PagerFn} from '../components/pager/pager.fn';
import {ResultsPerPage} from '../components/results-per-page/results-per-page.class';
import {ResultsPerPage as ResultsPerPageFn} from '../components/results-per-page/results-per-page.fn';
import {Section} from '../layout/section';
import {QuerySummary} from '../components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from '../components/query-summary/query-summary.fn';
import {FacetManager} from '../components/facet-manager/facet-manager.class';
import {FacetManager as FacetManagerFn} from '../components/facet-manager/facet-manager.fn';
import {CategoryFacet} from '../components/category-facet/category-facet.class';
import {CategoryFacet as CategoryFacetFn} from '../components/category-facet/category-facet.fn';
import {Facet} from '../components/facet/facet.class';
import {Facet as FacetFn} from '../components/facet/facet.fn';
import {NumericFacet} from '../components/numeric-facet/numeric-facet.class';
import {NumericFacet as NumericFacetFn} from '../components/numeric-facet/numeric-facet.fn';
import {DateFacet} from '../components/date-facet/date-facet.class';
import {DateFacet as DateFacetFn} from '../components/date-facet/date-facet.fn';
import {HistoryManager} from '../components/history-manager/history-manager.class';
import {HistoryManager as HistoryManagerFn} from '../components/history-manager/history-manager.fn';
import {RelevanceInspector} from '../components/relevance-inspector/relevance-inspector.class';
import {RelevanceInspector as RelevanceInspectorFn} from '../components/relevance-inspector/relevance-inspector.fn';
import {StandaloneSearchBox} from '../components/standalone-search-box/standalone-search-box.class';
import {StandaloneSearchBox as StandaloneSearchBoxFn} from '../components/standalone-search-box/standalone-search-box.fn';
import {
  HeadlessEngine,
  Engine,
  SearchEngine,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  recommendationAppReducers,
  RecommendationAppState,
  Unsubscribe,
  RecommendationList as HeadlessRecommendationList,
  buildRecommendationList,
  Tab as HeadlessTab,
  buildTab,
  BreadcrumbManager as HeadlessBreadcrumbManager,
  buildBreadcrumbManager,
  SearchBox as HeadlessSearchBox,
  buildSearchBox,
  DidYouMean as HeadlessDidYouMean,
  buildDidYouMean,
  SearchStatus as HeadlessSearchStatus,
  buildSearchStatus,
  QueryError as HeadlessQueryError,
  buildQueryError,
  QuerySummary as HeadlessQuerySummary,
  buildQuerySummary,
  ResultList as HeadlessResultList,
  buildResultList,
  FoldedResultList as HeadlessFoldedResultList,
  buildFoldedResultList,
  FacetManager as HeadlessFacetManager,
  buildFacetManager,
  CategoryFacet as HeadlessCategoryFacet,
  buildCategoryFacet,
  Facet as HeadlessFacet,
  buildFacet,
  NumericFacet as HeadlessNumericFacet,
  buildNumericFacet,
  buildNumericRange,
  DateFacet as HeadlessDateFacet,
  buildDateFacet,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildRelevanceSortCriterion,
  Sort as HeadlessSort,
  buildSort,
  SortOrder,
  SortCriterion,
  ResultsPerPage as HeadlessResultsPerPage,
  buildResultsPerPage,
  Pager as HeadlessPager,
  buildPager,
  HistoryManager as HeadlessHistoryManager,
  buildHistoryManager,
  RelevanceInspector as HeadlessRelevanceInspector,
  buildRelevanceInspector,
  StandaloneSearchBox as HeadlessStandaloneSearchBox,
  buildStandaloneSearchBox,
} from '@coveo/headless';
import {bindUrlManager} from '../components/url-manager/url-manager';
import {setContext} from '../components/context/context';
import {dateRanges} from '../components/date-facet/date-utils';

const [KB, MB, GB] = [1e3, 1e6, 1e9];

const criteria: [string, SortCriterion][] = [
  ['Relevance', buildRelevanceSortCriterion()],
  ['Date (Ascending)', buildDateSortCriterion(SortOrder.Ascending)],
  ['Date (Descending)', buildDateSortCriterion(SortOrder.Descending)],
  ['Size (Ascending)', buildFieldSortCriterion('size', SortOrder.Ascending)],
  ['Size (Descending)', buildFieldSortCriterion('size', SortOrder.Descending)],
];
const initialCriterion = criteria[0][1];

const resultsPerPageOptions = [10, 25, 50, 100];

export class SearchPage extends Component {
  private readonly engine: SearchEngine;
  private readonly recommendationEngine: Engine<RecommendationAppState>;

  private readonly recommendationList: HeadlessRecommendationList;
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
  private readonly createdAutomaticDateFacet: HeadlessDateFacet;
  private readonly createdManualDateFacet: HeadlessDateFacet;
  private readonly sort: HeadlessSort;
  private readonly resultsPerPage: HeadlessResultsPerPage;
  private readonly pager: HeadlessPager;
  private readonly historyManager: HeadlessHistoryManager;
  private readonly relevanceInspector: HeadlessRelevanceInspector;
  private readonly standaloneSearchBox: HeadlessStandaloneSearchBox;

  private unsubscribeUrlManager!: Unsubscribe;

  constructor(props: {}) {
    super(props);

    this.engine = buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });

    this.recommendationEngine = new HeadlessEngine({
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: recommendationAppReducers,
    });

    this.recommendationList = buildRecommendationList(
      this.recommendationEngine
    );

    this.tabs = {
      all: buildTab(this.engine, {
        initialState: {isActive: true},
        options: {expression: ''},
      }),
      messages: buildTab(this.engine, {
        options: {expression: '@objecttype==Message'},
      }),
      confluence: buildTab(this.engine, {
        options: {
          expression:
            '@connectortype==Confluence2Crawler AND NOT @documenttype==Space',
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

    this.geographyFacet = buildCategoryFacet(this.engine, {
      options: {field: 'geographicalhierarchy'},
    });
    this.objectTypeFacet = buildFacet(this.engine, {
      options: {field: 'objecttype'},
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

    this.createdAutomaticDateFacet = buildDateFacet(this.engine, {
      options: {
        field: 'created',
        facetId: 'created-3',
        generateAutomaticRanges: true,
      },
    });
    this.createdManualDateFacet = buildDateFacet(this.engine, {
      options: {
        field: 'created',
        facetId: 'created-4',
        generateAutomaticRanges: false,
        currentValues: dateRanges,
      },
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

    this.standaloneSearchBox = buildStandaloneSearchBox(this.engine, {
      options: {redirectionUrl: 'https://mywebsite.com/search'},
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

    // A search should not be executed until the search parameters are restored.
    this.executeInitialSearch();

    this.updateAnalyticsContext();
  }

  componentWillUnmount() {
    this.unsubscribeUrlManager();
  }

  private executeInitialSearch() {
    this.engine.executeFirstSearch();
  }

  private updateAnalyticsContext() {
    setContext(this.engine, '30-45', ['sports', 'camping', 'electronics']);
  }

  render() {
    return (
      <div>
        <AppContext.Provider
          value={{recommendationEngine: this.recommendationEngine}}
        >
          <Section title="recommendation-list">
            <RecommendationList />
            <RecommendationListFn controller={this.recommendationList} />
          </Section>
        </AppContext.Provider>
        <AppContext.Provider value={{engine: this.engine}}>
          <Section title="tabs">
            <nav>
              <Tab active>All</Tab>
              <Tab expression="@objecttype==Message">Messages</Tab>
              <Tab expression="@connectortype==Confluence2Crawler AND NOT @documenttype==Space">
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
          <Section title="facet">
            <FacetManager>
              <CategoryFacet
                field="geographicalhierarchy"
                facetId="geographicalhierarchy-1"
              />
              <Facet field="author" facetId="author-1" />
              <NumericFacet
                format={(bytes) => filesize(bytes, {base: 10})}
                field="size"
                facetId="size-1"
                generateAutomaticRanges={true}
              />
              <NumericFacet
                format={(bytes) => filesize(bytes, {base: 10})}
                field="size"
                facetId="size-2"
                generateAutomaticRanges={false}
                currentValues={[
                  buildNumericRange({start: 0, end: 5 * KB}),
                  buildNumericRange({start: 5 * KB, end: 5 * MB}),
                  buildNumericRange({start: 5 * MB, end: 5 * GB}),
                ]}
              />
              <DateFacet
                field="created"
                facetId="created-1"
                generateAutomaticRanges={true}
              />
              <DateFacet
                field="created"
                facetId="created-2"
                generateAutomaticRanges={false}
                currentValues={dateRanges}
              />
            </FacetManager>
            <FacetManagerFn controller={this.facetManager}>
              <CategoryFacetFn controller={this.geographyFacet} />
              <FacetFn controller={this.objectTypeFacet} />
              <NumericFacetFn
                controller={this.fileSizeAutomaticNumericFacet}
                format={(bytes) => filesize(bytes, {base: 10})}
              />
              <NumericFacetFn
                controller={this.fileSizeManualNumericFacet}
                format={(bytes) => filesize(bytes, {base: 10})}
              />
              <DateFacetFn controller={this.createdAutomaticDateFacet} />
              <DateFacetFn controller={this.createdManualDateFacet} />
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
          <Section title="standalone-search-box">
            <StandaloneSearchBox />
            <StandaloneSearchBoxFn controller={this.standaloneSearchBox} />
          </Section>
        </AppContext.Provider>
      </div>
    );
  }
}
