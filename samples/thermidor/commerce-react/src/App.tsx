import {EngineProvider} from './context/engine.js';
import {CommerceInterfaceProvider} from './context/commerce-interface.js';
import {SearchBox} from './components/SearchBox/SearchBox.js';
import {ProductList} from './components/ProductList/ProductList.js';
import {Pagination} from './components/Pagination/Pagination.js';
import styles from './App.module.css';

export default function App() {
  return (
    <EngineProvider>
      <CommerceInterfaceProvider>
        <main className={styles.root}>
          <SearchBox />
          <ProductList />
          <Pagination />
        </main>
      </CommerceInterfaceProvider>
    </EngineProvider>
  );
}
