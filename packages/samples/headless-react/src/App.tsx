import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {
  buildSearchBox,
  SearchBoxOptions,
  buildQuerySummary,
  buildResultList,
} from '@coveo/headless';
import {engine} from './engine';
import {Section} from './layout/section';
import {QuerySummary} from './components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from './components/query-summary/query-summary.fn';

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});
const querySummary = buildQuerySummary(engine);

const resultList = buildResultList(engine);

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
        <Section title="result-list">
          <ResultList />
          <ResultListFn controller={resultList} />
        </Section>
      </header>
    </div>
  );
}

export default App;
