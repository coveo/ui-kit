import {listingName} from '../navigation.js';
import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/**
 * A listing page. The published contract has no view id for listings yet, so it sends its category
 * as a search on `storefront-preview-search` and draws the surfaces its own turn created.
 */
export function ListingPage({slug, visitId}: {slug: string; visitId: number}) {
  const {turn, surfaces, ownsTurn} = usePageView(visitId);
  const isWaiting = !turn || turn.status === 'streaming';
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{listingName(slug)}</h1>
      <p className={styles.path}>/{slug}</p>
      <PageTurnStatus turn={turn} />
      {surfaces.length === 0 && isWaiting ? (
        <p className={styles.loading}>Loading the listing…</p>
      ) : surfaces.length === 0 && turn?.status === 'complete' ? (
        <p className={styles.note}>The server sent no products for this listing.</p>
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
