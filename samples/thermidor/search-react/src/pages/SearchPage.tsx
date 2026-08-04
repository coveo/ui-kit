import {SearchInterfaceProvider} from '../context/search-interface.js';
import {SearchBox} from '../components/SearchBox/SearchBox.js';
import {ResultList} from '../components/ResultList/ResultList.js';
import {Pagination} from '../components/Pagination/Pagination.js';
import {Sort} from '../components/Sort/Sort.js';

export function SearchPage() {
  return (
    <SearchInterfaceProvider>
      <SearchBox />
      <Sort />
      <ResultList />
      <Pagination />
    </SearchInterfaceProvider>
  );
}
