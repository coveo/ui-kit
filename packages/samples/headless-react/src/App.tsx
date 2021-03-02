import logo from './logo.svg';
import './App.css';
import {useEffect} from 'react';

import {RecommendationList} from './components/recommendation-list/recommendation-list.class';
import {RecommendationList as RecommendationListFn} from './components/recommendation-list/recommendation-list.fn';
import {Tab} from './components/tab/tab.class';
import {Tab as TabFn} from './components/tab/tab.fn';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {DidYouMean} from './components/did-you-mean/did-you-mean.class';
import {DidYouMean as DidYouMeanFn} from './components/did-you-mean/did-you-mean.fn';
import {SearchStatus} from './components/search-status/search-status.class';
import {SearchStatus as SearchStatusFn} from './components/search-status/search-status.fn';
import {QueryError} from './components/query-error/query-error.class';
import {QueryError as QueryErrorFn} from './components/query-error/query-error.fn';
import {Sort} from './components/sort/sort.class';
import {Sort as SortFn} from './components/sort/sort.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {Pager} from './components/pager/pager.class';
import {Pager as PagerFn} from './components/pager/pager.fn';
import {ResultsPerPage} from './components/results-per-page/results-per-page.class';
import {ResultsPerPage as ResultsPerPageFn} from './components/results-per-page/results-per-page.fn';
import {engine, recommendationEngine} from './engine';
import {Section} from './layout/section';
import {QuerySummary} from './components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from './components/query-summary/query-summary.fn';
import {FacetManager} from './components/facet-manager/facet-manager.class';
import {FacetManager as FacetManagerFn} from './components/facet-manager/facet-manager.fn';
import {Facet} from './components/facet/facet.class';
import {Facet as FacetFn} from './components/facet/facet.fn';
import {History} from './components/history/history.class';
import {History as HistoryFn} from './components/history/history.fn';
import {RelevanceInspector} from './components/relevance-inspector/relevance-inspector.class';
import {RelevanceInspector as RelevanceInspectorFn} from './components/relevance-inspector/relevance-inspector.fn';
import {
  buildRecommendationList,
  buildTab,
  buildSearchBox,
  buildDidYouMean,
  buildSearchStatus,
  buildQueryError,
  buildQuerySummary,
  buildResultList,
  buildFacetManager,
  buildFacet,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  SortOrder,
  SortCriterion,
  buildResultsPerPage,
  buildPager,
  buildHistory,
  buildRelevanceInspector,
} from '@coveo/headless';
import {bindSearchParametersToURI} from './components/search-parameter-manager/search-parameter-manager';
import {setContext} from './components/context/context';

const recommendationList = buildRecommendationList(recommendationEngine);

const tabs = {
  all: buildTab(engine, {
    initialState: {isActive: true},
    options: {expression: ''},
  }),
  messages: buildTab(engine, {
    options: {expression: '@objecttype==Message'},
  }),
  confluence: buildTab(engine, {
    options: {
      expression:
        '@connectortype==Confluence2Crawler AND NOT @documenttype==Space',
    },
  }),
};

const searchBox = buildSearchBox(engine, {options: {numberOfSuggestions: 8}});

const didYouMean = buildDidYouMean(engine);

const searchStatus = buildSearchStatus(engine);

const queryError = buildQueryError(engine);

const querySummary = buildQuerySummary(engine);

const facetManager = buildFacetManager(engine);

const objectTypeFacet = buildFacet(engine, {
  options: {field: 'objecttype'},
});
const fileTypeFacet = buildFacet(engine, {
  options: {field: 'filetype'},
});

const criteria: [string, SortCriterion][] = [
  ['Relevance', buildRelevanceSortCriterion()],
  ['Date (Ascending)', buildDateSortCriterion(SortOrder.Ascending)],
  ['Date (Descending)', buildDateSortCriterion(SortOrder.Descending)],
  ['Size (Ascending)', buildFieldSortCriterion('size', SortOrder.Ascending)],
  ['Size (Descending)', buildFieldSortCriterion('size', SortOrder.Descending)],
];
const initialCriterion = criteria[0][1];
const sort = buildSort(engine, {
  initialState: {criterion: initialCriterion},
});

const resultList = buildResultList(engine);

const resultsPerPageOptions = [10, 25, 50, 100];
const resultsPerPage = buildResultsPerPage(engine, {
  initialState: {numberOfResults: resultsPerPageOptions[0]},
});

const pager = buildPager(engine, {options: {numberOfPages: 6}});

const history = buildHistory(engine);

const relevanceInspector = buildRelevanceInspector(engine);

const {autoUpdateURI: startUpdatingURI} = bindSearchParametersToURI(engine);

function App() {
  useEffect(() => startUpdatingURI(), []);
  setContext('30-45', ['sports', 'camping', 'electronics']);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Section title="recommendation-list">
          <RecommendationList />
          <RecommendationListFn controller={recommendationList} />
        </Section>
        <Section title="tabs">
          <nav>
            <Tab active>All</Tab>
            <Tab expression="@objecttype==Message">Messages</Tab>
            <Tab expression="@connectortype==Confluence2Crawler AND NOT @documenttype==Space">
              Confluence
            </Tab>
          </nav>
          <nav>
            <TabFn controller={tabs.all}>All</TabFn>
            <TabFn controller={tabs.messages}>Messages</TabFn>
            <TabFn controller={tabs.confluence}>Confluence</TabFn>
          </nav>
        </Section>
        <Section title="search-box">
          <SearchBox />
          <SearchBoxFn controller={searchBox} />
        </Section>
        <Section title="did-you-mean">
          <DidYouMean />
          <DidYouMeanFn controller={didYouMean} />
        </Section>
        <Section title="search-status">
          <SearchStatus />
          <SearchStatusFn controller={searchStatus} />
        </Section>
        <Section title="query-error">
          <QueryError />
          <QueryErrorFn controller={queryError} />
        </Section>
        <Section title="query-summary">
          <QuerySummary />
          <QuerySummaryFn controller={querySummary} />
        </Section>
        <Section title="facet">
          <FacetManager>
            <Facet field="author" facetId="author-1" />
            <Facet field="category" facetId="category-1" />
          </FacetManager>
          <FacetManagerFn controller={facetManager}>
            <FacetFn controller={objectTypeFacet} />
            <FacetFn controller={fileTypeFacet} />
          </FacetManagerFn>
        </Section>
        <Section title="sort">
          <Sort criteria={criteria} initialCriterion={initialCriterion} />
          <SortFn controller={sort} criteria={criteria} />
        </Section>
        <Section title="result-list">
          <ResultList />
          <ResultListFn controller={resultList} />
        </Section>
        <Section title="results-per-page">
          <ResultsPerPage options={resultsPerPageOptions} />
          <ResultsPerPageFn
            controller={resultsPerPage}
            options={resultsPerPageOptions}
          />
        </Section>
        <Section title="pager">
          <Pager />
          <PagerFn controller={pager} />
        </Section>
        <Section title="history">
          <History />
          <HistoryFn controller={history} />
        </Section>
        <Section title="relevance-inspector">
          <RelevanceInspector />
          <RelevanceInspectorFn controller={relevanceInspector} />
        </Section>
      </header>
    </div>
  );
}

export default App;
