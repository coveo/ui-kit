import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {Sort} from './components/sort/sort.class';
import {Sort as SortFn} from './components/sort/sort.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {
  buildSearchBox,
  SearchBoxOptions,
  buildQuerySummary,
  buildResultList,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  buildSort,
  SortOrder,
} from '@coveo/headless';
import {engine} from './engine';
import {Section} from './layout/section';
import {QuerySummary} from './components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from './components/query-summary/query-summary.fn';

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});
const querySummary = buildQuerySummary(engine);

const criterions = {
  Relevance: buildRelevanceSortCriterion(),
  'Date (Ascending)': buildDateSortCriterion(SortOrder.Ascending),
  'Date (Descending)': buildDateSortCriterion(SortOrder.Descending),
  'Size (Ascending)': buildFieldSortCriterion('size', SortOrder.Ascending),
  'Size (Descending)': buildFieldSortCriterion('size', SortOrder.Descending),
  Suggested: buildQueryRankingExpressionSortCriterion(),
  None: buildNoSortCriterion(),
};
const sort = buildSort(engine, {
  initialState: {criterion: criterions.Suggested},
});

const fieldsToInclude = {author: 'Author', filetype: 'File type'};
const resultList = buildResultList(engine, {
  options: {fieldsToInclude: Object.keys(fieldsToInclude)},
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Section title="search-box">
          <SearchBox />
          <SearchBoxFn controller={searchBox} />
        </Section>
        <Section title="query-summary">
          <QuerySummary />
          <QuerySummaryFn controller={querySummary} />
        </Section>
        <Section title="sort">
          <Sort />
          <SortFn controller={sort} criterions={criterions} />
        </Section>
        <Section title="result-list">
          <ResultList />
          <ResultListFn controller={resultList} />
        </Section>
      </header>
    </div>
  );
}

export default App;
