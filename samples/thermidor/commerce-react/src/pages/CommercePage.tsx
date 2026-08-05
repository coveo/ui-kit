import {CommerceInterfaceProvider} from '../context/commerce-interface.js';
import {SearchBox} from '../components/SearchBox/SearchBox.js';
import {Sort} from '../components/Sort/Sort.js';
import {ProductList} from '../components/ProductList/ProductList.js';
import {Pagination} from '../components/Pagination/Pagination.js';

export function CommercePage() {
  return (
    <CommerceInterfaceProvider>
      <SearchBox />
      <Sort />
      <ProductList />
      <Pagination />
    </CommerceInterfaceProvider>
  );
}
