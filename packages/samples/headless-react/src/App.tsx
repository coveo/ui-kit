import {useState} from 'react';
import {SearchPage} from './pages/SearchPage';
import {AboutPage} from './pages/AboutPage';

export type Page = 'search' | 'about';

export interface AppState {
  currentPage: Page;
}

function App() {
  const [state, setState] = useState<AppState>({currentPage: 'search'});

  return (
    <main className="App">
      <nav>
        <button
          disabled={state.currentPage === 'search'}
          onClick={() => setState({currentPage: 'search'})}
        >
          Search
        </button>
        <button
          disabled={state.currentPage === 'about'}
          onClick={() => setState({currentPage: 'about'})}
        >
          About
        </button>
      </nav>
      {state.currentPage === 'search' ? <SearchPage /> : <AboutPage />}
    </main>
  );
}

export default App;
