import React, {FunctionComponent, useState} from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import {List} from './List';
import {Folded} from './Folded';
import {HeaderLink} from './HeaderLink';
import {CustomChildren} from './CustomChildren';

const LIST_PAGE = 'List';
const FOLDED_LIST_PAGE = 'Folded list';
const FOLDED_CUSTOM_CHILDREN_PAGE = 'Folded list with custom children';

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
      {page === LIST_PAGE && <List />}
      {page === FOLDED_LIST_PAGE && <Folded />}
      {page === FOLDED_CUSTOM_CHILDREN_PAGE && <CustomChildren />}
    </>
  );
};

ReactDOM.hydrate(<App />, document.getElementById('root'));
