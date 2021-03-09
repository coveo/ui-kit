import './SearchPage.css';
import {Component} from 'react';
import filesize from 'filesize';
import {AppContext} from '../context/engine';

import {RecommendationList} from '../components/recommendation-list/recommendation-list.class';
import {RecommendationList as RecommendationListFn} from '../components/recommendation-list/recommendation-list.fn';
import {Tab} from '../components/tab/tab.class';
import {Tab as TabFn} from '../components/tab/tab.fn';
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
import {History} from '../components/history/history.class';
import {History as HistoryFn} from '../components/history/history.fn';
import {RelevanceInspector} from '../components/relevance-inspector/relevance-inspector.class';
import {RelevanceInspector as RelevanceInspectorFn} from '../components/relevance-inspector/relevance-inspector.fn';
import {
  HeadlessEngine,
  recommendationAppReducers,
  searchAppReducers,
  RecommendationList as HeadlessRecommendationList,
  buildRecommendationList,
  Tab as HeadlessTab,
  buildTab,
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
  FacetManager as HeadlessFacetManager,
  buildFacetManager,
  CategoryFacet as HeadlessCategoryFacet,
  buildCategoryFacet,
  Facet as HeadlessFacet,
  buildFacet,
  NumericFacet as HeadlessNumericFacet,
  buildNumericFacet,
  buildNumericRange,
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
  History as HeadlessHistory,
  buildHistory,
  RelevanceInspector as HeadlessRelevanceInspector,
  buildRelevanceInspector,
  AnalyticsActions,
  SearchActions,
  Unsubscribe,
} from '@coveo/headless';
import {bindSearchParametersToURI} from '../components/search-parameter-manager/search-parameter-manager';
import {setContext} from '../components/context/context';

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
  private readonly engine: HeadlessEngine<typeof searchAppReducers>;
  private readonly recommendationEngine: HeadlessEngine<
    typeof recommendationAppReducers
  >;

  private readonly recommendationList: HeadlessRecommendationList;
  private readonly tabs: {
    all: HeadlessTab;
    messages: HeadlessTab;
    confluence: HeadlessTab;
  };
  private readonly searchBox: HeadlessSearchBox;
  private readonly didYouMean: HeadlessDidYouMean;
  private readonly searchStatus: HeadlessSearchStatus;
  private readonly queryError: HeadlessQueryError;
  private readonly querySummary: HeadlessQuerySummary;
  private readonly resultList: HeadlessResultList;
  private readonly facetManager: HeadlessFacetManager;
  private readonly geographyFacet: HeadlessCategoryFacet;
  private readonly objectTypeFacet: HeadlessFacet;
  private readonly fileSizeAutomaticNumericFacet: HeadlessNumericFacet;
  private readonly fileSizeManualNumericFacet: HeadlessNumericFacet;
  private readonly sort: HeadlessSort;
  private readonly resultsPerPage: HeadlessResultsPerPage;
  private readonly pager: HeadlessPager;
  private readonly history: HeadlessHistory;
  private readonly relevanceInspector: HeadlessRelevanceInspector;

  private stopUpdatingSearchParameters?: Unsubscribe;

  constructor(props: {}) {
    super(props);

    this.engine = new HeadlessEngine({
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchAppReducers,
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

    this.sort = buildSort(this.engine, {
      initialState: {criterion: initialCriterion},
    });

    this.resultList = buildResultList(this.engine);

    this.resultsPerPage = buildResultsPerPage(this.engine, {
      initialState: {numberOfResults: resultsPerPageOptions[0]},
    });

    this.pager = buildPager(this.engine, {options: {numberOfPages: 6}});

    this.history = buildHistory(this.engine);

    this.relevanceInspector = buildRelevanceInspector(this.engine);
  }

  componentDidMount() {
    // Search parameters are restored once `SearchParametersManager` is registered,
    // which in this sample corresponds with when `bindSearchParametersToURI is called.
    // Beware not to restore search parameters until all components are registered,
    // otherwise some components such as facets may not work when the page loads.
    // In this sample, `SearchPage.componentDidMount` happens to be executed after
    // all components are registered, but depending on your implementation this may
    // not be your case.
    const {autoUpdateURI} = bindSearchParametersToURI(this.engine);
    this.stopUpdatingSearchParameters = autoUpdateURI();

    // A search should not be executed until the search parameters are restored.
    this.executeInitialSearch();

    this.updateAnalyticsContext();
  }

  componentWillUnmount() {
    this.stopUpdatingSearchParameters!();
  }

  private executeInitialSearch() {
    this.engine.dispatch(
      SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
    );
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
          <Section title="history">
            <History />
            <HistoryFn controller={this.history} />
          </Section>
          <Section title="relevance-inspector">
            <RelevanceInspector />
            <RelevanceInspectorFn controller={this.relevanceInspector} />
          </Section>
        </AppContext.Provider>
      </div>
    );
  }
}
