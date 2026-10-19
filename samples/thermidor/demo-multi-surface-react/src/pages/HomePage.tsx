import {useViewSurfaces} from '../session/storefront-session.js';
import {SurfaceList} from '../views/SurfaceList.js';
import {PageTurnStatus} from './PageTurnStatus.js';
import styles from './pages.module.css';

/** The home page (`storefront-preview-home`): the surfaces its own turn created. */
export function HomePage({visitId}: {visitId: number}) {
  const {stream, surfacesOfVisit, turnsOfVisit, latestTurnId} = useViewSurfaces();
  const turn = turnsOfVisit(visitId).at(-1);
  const surfaceIds = surfacesOfVisit(visitId);
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Home</h1>
      <PageTurnStatus turn={turn} isLatestTurn={turn?.id === latestTurnId} />
      {surfaceIds.length === 0 && turn?.status !== 'error' ? (
        <p className={styles.loading}>Loading recommendations…</p>
      ) : (
        <SurfaceList
          surfaceIds={surfaceIds}
          loadingSurfaces={stream.loadingSurfaces}
          isStreaming={turn?.status === 'streaming'}
        />
      )}
    </main>
  );
}
