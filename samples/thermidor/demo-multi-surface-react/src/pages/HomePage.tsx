import {ViewSurfaces} from '../views/ViewSurfaces.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import {usePageView} from './use-page-view.js';
import styles from './pages.module.css';

/** The home page (`storefront-preview-home`): the surfaces its own turn created. */
export function HomePage({visitId}: {visitId: number}) {
  const {turn, surfaces, ownsTurn} = usePageView(visitId);
  const isWaiting = !turn || turn.status === 'streaming';
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Home</h1>
      <PageTurnStatus turn={turn} />
      {surfaces.length === 0 && isWaiting ? (
        <p className={styles.loading}>Loading recommendations…</p>
      ) : surfaces.length === 0 && turn?.status === 'complete' ? (
        <p className={styles.note}>The server sent no recommendations for this page.</p>
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
