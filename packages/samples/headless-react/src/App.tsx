import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {DidYouMean} from './components/did-you-mean/did-you-mean.class';
import {DidYouMean as DidYouMeanFn} from './components/did-you-mean/did-you-mean.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {
  buildSearchBox,
  SearchBoxOptions,
  buildDidYouMean,
  buildQuerySummary,
  buildResultList,
} from '@coveo/headless';
import {engine} from './engine';
import {Section} from './layout/section';
import {QuerySummary} from './components/query-summary/query-summary.class';
import {QuerySummary as QuerySummaryFn} from './components/query-summary/query-summary.fn';

const options: SearchBoxOptions = {numberOfSuggestions: 8};

const searchBox = buildSearchBox(engine, {options});

const didYouMean = buildDidYouMean(engine);

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
        <Section title="did-you-mean">
          <DidYouMean />
          <DidYouMeanFn controller={didYouMean} />
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
