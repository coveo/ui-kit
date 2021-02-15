import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {DidYouMean} from './components/did-you-mean/did-you-mean.class';
import {DidYouMean as DidYouMeanFn} from './components/did-you-mean/did-you-mean.fn';
import {QueryError} from './components/query-error/query-error.class';
import {QueryError as QueryErrorFn} from './components/query-error/query-error.fn';
import {Sort} from './components/sort/sort.class';
import {Sort as SortFn} from './components/sort/sort.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {Pager} from './components/pager/pager.class';
import {Pager as PagerFn} from './components/pager/pager.fn';
import {
  buildSearchBox,
  buildDidYouMean,
  buildQueryError,
  buildQuerySummary,
  buildResultList,
  buildFacet,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  SortOrder,
  SortCriterion,
  buildResultsPerPage,
  buildPager,
} from '@coveo/headless';
import {ResultsPerPage} from './components/results-per-page/results-per-page.class';
import {ResultsPerPage as ResultsPerPageFn} from './components/results-per-page/results-per-page.fn';
import {engine} from './engine';
import {Section} from './layout/section';
import {QuerySummary} from './components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from './components/query-summary/query-summary.fn';
import {Facet} from './components/facet/facet.class';
import {Facet as FacetFn} from './components/facet/facet.fn';

const searchBox = buildSearchBox(engine, {options: {numberOfSuggestions: 8}});

const didYouMean = buildDidYouMean(engine);

const queryError = buildQueryError(engine);

const querySummary = buildQuerySummary(engine);

const facet = buildFacet(engine, {options: {field: 'filetype'}});

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

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Section title="search-box">
          <SearchBox />
          <SearchBoxFn controller={searchBox} />
        </Section>
        <Section title="did-you-mean">
          <DidYouMean />
          <DidYouMeanFn controller={didYouMean} />
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
          <Facet field="author" facetId="author-1" />
          <FacetFn controller={facet} />
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
      </header>
    </div>
  );
}

export default App;
