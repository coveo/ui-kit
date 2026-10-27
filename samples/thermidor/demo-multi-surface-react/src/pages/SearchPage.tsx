import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/**
 * Search results (`storefront-preview-search`): the surfaces its own turn created, such as the
 * commerce search layout with its facets, sort and pagination.
 */
export function SearchPage({query}: {query: string}) {
  const {turn, surfaces, ownsTurn} = usePageView();
  const isWaiting = !turn || turn.status === 'streaming';
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Results for “{query}”</h1>
      <PageTurnStatus turn={turn} />
      {surfaces.length === 0 && isWaiting ? (
        <p className={styles.loading}>Searching…</p>
      ) : surfaces.length === 0 && turn?.status === 'complete' ? (
        <p className={styles.note}>The server sent no results for this search.</p>
      ) : (
        <ViewSurfaces
          surfaces={surfaces}
          ownsTurn={ownsTurn}
          isStreaming={turn?.status === 'streaming'}
        />
      )}
    </main>
  );
}
