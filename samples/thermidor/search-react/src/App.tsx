import {EngineProvider} from './context/engine.js';
import {SearchInterfaceProvider} from './context/search-interface.js';
import {SearchBox} from './components/SearchBox/SearchBox.js';
import {ResultList} from './components/ResultList/ResultList.js';
import {Pagination} from './components/Pagination/Pagination.js';
import styles from './App.module.css';

export default function App() {
  return (
    <EngineProvider>
      <SearchInterfaceProvider>
        <main className={styles.root}>
          <SearchBox />
          <ResultList />
          <Pagination />
        </main>
      </SearchInterfaceProvider>
    </EngineProvider>
  );
}
