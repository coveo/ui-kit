import {InProgress} from '../components/InProgress.js';
import styles from './pages.module.css';

/** Search results. The published contract has no view id for them yet, so nothing is sent. */
export function SearchPage({query}: {query: string}) {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Results for “{query}”</h1>
      <InProgress title="Search results">
        Products, facets and sort for a query. The published contract has no view id for search
        results yet, so the preview sends no request. Turn the AI toggle on to ask the shopping
        assistant instead.
      </InProgress>
    </main>
  );
}
