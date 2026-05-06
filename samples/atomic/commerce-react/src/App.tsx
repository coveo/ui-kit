import {useState} from 'react';
import './App.css';
import {CommerceSearchPage} from './pages/CommerceSearchPage';
import {CommerceRecommendationPage} from './pages/CommerceRecommendationPage';

const SEARCH_PAGE = 'Commerce Search';
const RECOMMENDATIONS_PAGE = 'Recommendations';

const pages = [SEARCH_PAGE, RECOMMENDATIONS_PAGE];

function App() {
  const [page, setPage] = useState(SEARCH_PAGE);

  return (
    <>
      <header>
        <nav>
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={page === p ? 'active' : ''}
            >
              {p}
            </button>
          ))}
        </nav>
      </header>
      {page === SEARCH_PAGE && <CommerceSearchPage />}
      {page === RECOMMENDATIONS_PAGE && <CommerceRecommendationPage />}
    </>
  );
}

export default App;
