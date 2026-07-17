import {SearchBox} from './components/SearchBox/SearchBox.js';
import {ProductList} from './components/ProductList/ProductList.js';
import {Pagination} from './components/Pagination/Pagination.js';
import styles from './App.module.css';

export default function App() {
  return (
    <main className={styles.root}>
      <SearchBox />
      <ProductList />
      <Pagination />
    </main>
  );
}
