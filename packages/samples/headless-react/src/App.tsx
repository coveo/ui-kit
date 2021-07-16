import {useState} from 'react';
import {SearchPage, SearchPageProps} from './pages/SearchPage';
import {AboutPage} from './pages/AboutPage';
import {BrowserRouter, Link, Switch, Route} from 'react-router-dom';
import {RecommendationPage} from './pages/RecommendationPage';

export type Page = 'search' | 'recommendation' | 'about';

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
            <Link to="/">Search</Link>
          </button>
          <button
            disabled={state.currentPage === 'recommendation'}
            onClick={() => setState({currentPage: 'recommendation'})}
          >
            <Link to="/recommendation">Recommendation</Link>
          </button>
          <button
            disabled={state.currentPage === 'about'}
            onClick={() => setState({currentPage: 'about'})}
          >
            <Link to="/about">About</Link>
          </button>
        </nav>
        <Switch>
          <Route path="/recommendation">
            <RecommendationPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/">
            <SearchPage {...props} />
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
