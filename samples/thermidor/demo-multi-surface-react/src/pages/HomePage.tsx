import {SLOTS, surfacesInSlot} from '../layout/surface-layout.js';
import {Slot} from '../layout/Slot.js';
import {useSurfaceLayout} from '../session/storefront-session.js';
import styles from './pages.module.css';

interface HomePageProps {
  /** The index of the first turn of this visit: older `main` surfaces belong to another page. */
  sinceTurnIndex: number;
}

/** The home page: recommendations, drawn from the `main` slot. */
export function HomePage({sinceTurnIndex}: HomePageProps) {
  const layout = useSurfaceLayout();
  const surfaces = surfacesInSlot(layout, SLOTS.main, sinceTurnIndex);
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Home</h1>
      {surfaces.length === 0 ? (
        <p className={styles.loading}>Loading recommendations…</p>
      ) : (
        <Slot name={SLOTS.main} surfaces={surfaces} className={styles.surfaces} />
      )}
    </main>
  );
}
