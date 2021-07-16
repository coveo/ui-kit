import {useState} from 'react';
import {SearchPage, SearchPageProps} from './pages/SearchPage';
import {AboutPage} from './pages/AboutPage';
import {BrowserRouter, NavLink, Switch, Route} from 'react-router-dom';
import {RecommendationPage} from './pages/RecommendationPage';

export type Page = 'search' | 'recommendation' | 'about';

export interface AppState {
  currentPage: Page;
}

function App(props: SearchPageProps) {
  const activeNavLink: React.CSSProperties = {color: 'red'};

  return (
    <BrowserRouter>
      <main className="App">
        <nav>
          <button>
            <NavLink exact to="/" activeStyle={activeNavLink}>
              Search
            </NavLink>
          </button>
          <button>
            <NavLink to="/recommendation" activeStyle={activeNavLink}>
              Recommendation
            </NavLink>
          </button>
          <button>
            <NavLink to="/about" activeStyle={activeNavLink}>
              About
            </NavLink>
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
