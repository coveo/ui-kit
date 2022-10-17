import React, {FunctionComponent, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';
import {ResultListPage} from './pages/ResultListPage';
import {FoldedResultListPage} from './pages/FoldedResultListPage';
import {HeaderLink} from './components/HeaderLink';
import {InstantResultsPage} from './pages/InstantResultsPage';
import {TableResultListPage} from './pages/TableResultListPage';
import {RecsPage} from './pages/RecsPage';

const LIST_PAGE = 'Result list';
const FOLDED_LIST_PAGE = 'Folded result list';
const INSTANT_RESULTS_PAGE = 'Instant results';
const TABLE_RESULT_LIST_PAGE = 'Table result list';
const RECS_PAGE = 'Recs Interface';

const pages = [
  LIST_PAGE,
  FOLDED_LIST_PAGE,
  INSTANT_RESULTS_PAGE,
  TABLE_RESULT_LIST_PAGE,
  RECS_PAGE,
];
const App: FunctionComponent = () => {
  const initialPage = pages.find((page) =>
    decodeURIComponent(window.location.search).includes(`page=${page}`)
  );
  const [page, setPage] = useState(initialPage || LIST_PAGE);
  return (
    <>
      <header>
        <span className="pageTitle">{page} example</span>
        <ul>
          <HeaderLink page={LIST_PAGE} currentPage={page} setPage={setPage} />
          <HeaderLink
            page={FOLDED_LIST_PAGE}
            currentPage={page}
            setPage={setPage}
          />
          <HeaderLink
            page={INSTANT_RESULTS_PAGE}
            currentPage={page}
            setPage={setPage}
          />
          <HeaderLink
            page={TABLE_RESULT_LIST_PAGE}
            currentPage={page}
            setPage={setPage}
          />
          <HeaderLink page={RECS_PAGE} currentPage={page} setPage={setPage} />
        </ul>
      </header>
      {page === LIST_PAGE && <ResultListPage />}
      {page === FOLDED_LIST_PAGE && <FoldedResultListPage />}
      {page === INSTANT_RESULTS_PAGE && <InstantResultsPage />}
      {page === TABLE_RESULT_LIST_PAGE && <TableResultListPage />}
      {page === RECS_PAGE && <RecsPage />}
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
