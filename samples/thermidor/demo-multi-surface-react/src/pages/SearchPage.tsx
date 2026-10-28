import {ChatPanel} from '../components/ChatPanel.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/**
 * Search results (`storefront-preview-search`) in the middle: the surfaces its own turns created,
 * such as the commerce search layout with its facets, sort and pagination. The assistant's chat
 * panel sits on the right, on the same visit, and its answers stay in the panel.
 */
export function SearchPage({query, visitId}: {query: string; visitId: number}) {
  const {turn, surfaces} = usePageView(visitId, 'storefront-preview-search');
  const isWaiting = !turn || turn.status === 'streaming';
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      <h1 className={styles.title}>Results for “{query}”</h1>
      <div className={styles.withPanel}>
        <section className={styles.results} aria-label="Search results">
          <PageTurnStatus turn={turn} />
          {surfaces.length === 0 && isWaiting ? (
            <p className={styles.loading}>Searching…</p>
          ) : surfaces.length === 0 && turn?.status === 'complete' ? (
            <p className={styles.note}>The server sent no results for this search.</p>
          ) : (
            <ViewSurfaces surfaces={surfaces} isStreaming={turn?.status === 'streaming'} />
          )}
        </section>
        <ChatPanel visitId={visitId} />
      </div>
    </main>
  );
}
