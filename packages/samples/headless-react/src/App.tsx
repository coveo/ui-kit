import {useState} from 'react';
import {SearchPage, SearchPageProps} from './pages/SearchPage';
import {AboutPage} from './pages/AboutPage';
import {BrowserRouter, Link, Switch, Route} from 'react-router-dom';

export type Page = 'search' | 'about';

export interface AppState {
  currentPage: Page;
}

function App(props: SearchPageProps) {
  const [state, setState] = useState<AppState>({currentPage: 'search'});

  return (
    <BrowserRouter>
      <main className="App">
        <nav>
          <button
            disabled={state.currentPage === 'search'}
            onClick={() => setState({currentPage: 'search'})}
          >
            <Link to="/search">Search</Link>
          </button>
          <button
            disabled={state.currentPage === 'about'}
            onClick={() => setState({currentPage: 'about'})}
          >
            <Link to="/about">About</Link>
          </button>
        </nav>
        <Switch>
          <Route path="/search">
            <SearchPage {...props} />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
