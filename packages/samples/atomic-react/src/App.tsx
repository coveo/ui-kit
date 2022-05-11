import React, {FunctionComponent, useState} from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import {ResultListPage} from './pages/ResultListPage';
import {FoldedResultListPage} from './pages/FoldedResultListPage';
import {HeaderLink} from './components/HeaderLink';
import {FoldedResultListWithCustomChildrenPage} from './pages/FoldedResultListWithCustomChildrenPage';

const LIST_PAGE = 'Result list';
const FOLDED_LIST_PAGE = 'Folded result list';
const FOLDED_CUSTOM_CHILDREN_PAGE = 'Folded result list with custom children';

const App: FunctionComponent = () => {
  const [page, setPage] = useState(LIST_PAGE);
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
            page={FOLDED_CUSTOM_CHILDREN_PAGE}
            currentPage={page}
            setPage={setPage}
          />
        </ul>
      </header>
      {page === LIST_PAGE && <ResultListPage />}
      {page === FOLDED_LIST_PAGE && <FoldedResultListPage />}
      {page === FOLDED_CUSTOM_CHILDREN_PAGE && (
        <FoldedResultListWithCustomChildrenPage />
      )}
    </>
  );
};

ReactDOM.hydrate(<App />, document.getElementById('root'));
