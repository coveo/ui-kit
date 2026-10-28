import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import {ChatPanel} from '../components/ChatPanel.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import styles from './pages.module.css';

interface SearchPageProps {
  query: string;
  visitId: number;
  turn: Turn | undefined;
  surfaces: readonly DiscoveredSurface[];
}

/**
 * The search layout: the results in the middle, such as the commerce search layout with its
 * facets, sort and pagination. The assistant's chat panel sits on the right, on the same visit,
 * and its answers stay in the panel.
 */
export function SearchPage({query, visitId, turn, surfaces}: SearchPageProps) {
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      <h1 className={styles.title}>Results for “{query}”</h1>
      <div className={styles.withPanel}>
        <section className={styles.results} aria-label="Search results">
          <PageTurnStatus turn={turn} />
          <ViewSurfaces surfaces={surfaces} isStreaming={turn?.status === 'streaming'} />
        </section>
        <ChatPanel visitId={visitId} />
      </div>
    </main>
  );
}
