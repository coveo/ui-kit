import logo from './logo.svg';
import './App.css';
import {SearchBox} from './components/search-box/search-box.class';
import {SearchBox as SearchBoxFn} from './components/search-box/search-box.fn';
import {buildSearchBox, SearchBoxOptions} from '@coveo/headless';
import {engine} from './engine';
import {Section} from './layout/section';

const options: SearchBoxOptions = {numberOfSuggestions: 8};
const searchBox = buildSearchBox(engine, {options});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <Section title="SearchBox">
          <SearchBox />
          {/* <hr/> */}
          <SearchBoxFn searchBox={searchBox} />
        </Section>
      </header>
    </div>
  );
}

export default App;
