import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {ResultList} from './components/result-list/result-list.class';
import {ResultList as ResultListFn} from './components/result-list/result-list.fn';
import {
  buildSearchBox,
  SearchBoxOptions,
  buildResultList,
} from '@coveo/headless';
import {engine} from './engine';
import {Section} from './layout/section';

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});
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
        <Section title="result-list">
          <ResultList />
          <ResultListFn controller={resultList} />
        </Section>
      </header>
    </div>
  );
}

export default App;
