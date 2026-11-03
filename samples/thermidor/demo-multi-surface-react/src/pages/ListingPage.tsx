import {ChatPanel} from '../components/ChatPanel.js';
import {LISTING_VIEW, LISTINGS} from '../navigation.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/**
 * A listing page: its products, with the assistant's chat panel next to them. The published
 * contract has no request that opens a listing, so the page sends its category as a search.
 */
export function ListingPage({slug, visitId}: {slug: string; visitId: number}) {
  const listing = LISTINGS.find((candidate) => candidate.slug === slug);
  const {turn, surfaces} = usePageView(visitId, LISTING_VIEW);
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      <div className={styles.withPanel}>
        <header className={styles.panelTitle}>
          <h1 className={styles.title}>{listing?.name ?? slug}</h1>
          <p className={styles.path}>/{slug}</p>
        </header>
        <section className={styles.results} aria-label="Listing results">
          <PageTurnStatus turn={turn} />
          <ViewSurfaces surfaces={surfaces} isStreaming={turn?.status === 'streaming'} />
        </section>
        <ChatPanel visitId={visitId} className={styles.panel} />
      </div>
    </main>
  );
}
